import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from "n8n-workflow";
import { NodeApiError, NodeOperationError } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	boardResourceLocator,
	columnResourceLocator,
	extractResourceLocatorValue,
	itemResourceLocator,
} from "../../../utils/resourceLocator";

const BATCHED_OP_DISPLAY = {
	resource: ["boardItem"],
	operation: ["changeColumnValueBatched"],
};

export const boardItemChangeColumnValueBatched: INodeProperties[] = [
	boardResourceLocator({
		displayName: "Board",
		name: "boardId",
		required: true,
		description:
			"The board the item belongs to. Use \"By ID\" mode with an expression so the value can vary per input row.",
		displayOptions: { show: BATCHED_OP_DISPLAY },
	}),
	itemResourceLocator({
		displayName: "Item",
		name: "itemId",
		required: true,
		description:
			"The item to update. Use \"By ID\" mode with an expression so the value can vary per input row.",
		displayOptions: { show: BATCHED_OP_DISPLAY },
	}),
	columnResourceLocator({
		displayName: "Column",
		name: "columnId",
		required: true,
		description:
			"The column to change. Use \"By ID\" mode with an expression so the value can vary per input row.",
		displayOptions: { show: BATCHED_OP_DISPLAY },
	}),
	{
		displayName: "Value (JSON)",
		name: "value",
		type: "json",
		required: true,
		default: "",
		typeOptions: { alwaysOpenEditWindow: true },
		displayOptions: { show: BATCHED_OP_DISPLAY },
	},
	{
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: { show: BATCHED_OP_DISPLAY },
		options: [
			{
				displayName: "Chunk Size",
				name: "chunkSize",
				type: "number",
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 25,
				description:
					"Maximum number of mutations to send in a single GraphQL request. Larger values reduce round-trips but risk hitting Monday.com's per-request complexity ceiling.",
			},
		],
	},
];

const DEFAULT_CHUNK_SIZE = 25;

interface BatchedRow {
	itemIndex: number;
	boardId: string;
	itemId: string;
	columnId: string;
	value: string;
}

interface BatchedRowError {
	itemIndex: number;
	error: NodeOperationError;
}

function chunk<T>(arr: T[], size: number): T[][] {
	if (size <= 0) return [arr];
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		out.push(arr.slice(i, i + size));
	}
	return out;
}

async function executeBatch(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	if (items.length === 0) return [];

	const additionalFields = this.getNodeParameter(
		"additionalFields",
		0,
		{},
	) as { chunkSize?: number };
	const chunkSize = additionalFields.chunkSize ?? DEFAULT_CHUNK_SIZE;

	const continueOnFail = this.continueOnFail();

	const rows: BatchedRow[] = [];
	const preErrors: BatchedRowError[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const boardId = extractResourceLocatorValue(
				this.getNodeParameter("boardId", i),
			);
			const itemId = extractResourceLocatorValue(
				this.getNodeParameter("itemId", i),
			);
			const columnId = extractResourceLocatorValue(
				this.getNodeParameter("columnId", i),
			);
			const rawValue = this.getNodeParameter("value", i) as string;

			let normalizedValue: string;
			try {
				normalizedValue = JSON.stringify(JSON.parse(rawValue));
			} catch {
				throw new NodeOperationError(
					this.getNode(),
					"Value must be valid JSON",
					{ itemIndex: i },
				);
			}

			rows.push({
				itemIndex: i,
				boardId,
				itemId,
				columnId,
				value: normalizedValue,
			});
		} catch (error) {
			if (!continueOnFail) throw error;
			preErrors.push({ itemIndex: i, error: error as NodeOperationError });
		}
	}

	const resultsByIndex = new Map<number, INodeExecutionData>();

	for (const { itemIndex, error } of preErrors) {
		resultsByIndex.set(itemIndex, {
			json: { error: error.message },
			pairedItem: { item: itemIndex },
		});
	}

	const chunks = chunk(rows, chunkSize);

	for (const group of chunks) {
		if (group.length === 0) continue;

		const queryVars: string[] = [];
		const aliases: string[] = [];
		const variables: IDataObject = {};

		group.forEach((row, k) => {
			queryVars.push(
				`$bid${k}: ID!`,
				`$iid${k}: ID!`,
				`$cid${k}: String!`,
				`$v${k}: JSON!`,
			);
			aliases.push(
				`m${k}: change_column_value(board_id: $bid${k}, item_id: $iid${k}, column_id: $cid${k}, value: $v${k}) { id }`,
			);
			variables[`bid${k}`] = row.boardId;
			variables[`iid${k}`] = row.itemId;
			variables[`cid${k}`] = row.columnId;
			variables[`v${k}`] = row.value;
		});

		const body: IGraphqlBody = {
			query: `mutation (${queryVars.join(", ")}) {\n${aliases.join("\n")}\n}`,
			variables,
		};

		let response: {
			data?: Record<string, { id: string } | null>;
			errors?: Array<{ message: string; path?: Array<string | number> }>;
		};

		try {
			response = await mondayProApiRequest.call(this, body);
		} catch (error) {
			if (!continueOnFail) throw error;
			const message = (error as Error).message ?? "Request failed";
			for (const row of group) {
				resultsByIndex.set(row.itemIndex, {
					json: { error: message },
					pairedItem: { item: row.itemIndex },
				});
			}
			continue;
		}

		if (!response) {
			const err = new NodeApiError(this.getNode(), {
				message: "No response from API",
			});
			if (!continueOnFail) throw err;
			for (const row of group) {
				resultsByIndex.set(row.itemIndex, {
					json: { error: "No response from API" },
					pairedItem: { item: row.itemIndex },
				});
			}
			continue;
		}

		const errorByAlias = new Map<string, string>();
		if (Array.isArray(response.errors)) {
			for (const err of response.errors) {
				const alias = err.path?.[0];
				if (typeof alias === "string") {
					errorByAlias.set(alias, err.message);
				}
			}
			const unrouted = response.errors.filter(
				(e) => typeof e.path?.[0] !== "string",
			);
			if (unrouted.length > 0 && !continueOnFail) {
				throw new NodeApiError(this.getNode(), {
					message: `GraphQL Error: ${unrouted.map((e) => e.message).join(", ")}`,
				});
			}
		}

		group.forEach((row, k) => {
			const alias = `m${k}`;
			const aliasError = errorByAlias.get(alias);
			const aliasData = response.data?.[alias] ?? null;

			if (aliasError !== undefined || aliasData === null) {
				const message = aliasError ?? "Mutation returned null";
				if (!continueOnFail) {
					throw new NodeApiError(
						this.getNode(),
						{ message: `GraphQL Error: ${message}` },
						{ itemIndex: row.itemIndex },
					);
				}
				resultsByIndex.set(row.itemIndex, {
					json: { error: message },
					pairedItem: { item: row.itemIndex },
				});
				return;
			}

			resultsByIndex.set(row.itemIndex, {
				json: aliasData as unknown as IDataObject,
				pairedItem: { item: row.itemIndex },
			});
		});
	}

	const out: INodeExecutionData[] = [];
	for (let i = 0; i < items.length; i++) {
		const row = resultsByIndex.get(i);
		if (row) out.push(row);
	}
	return out;
}

export const boardItemChangeColumnValueBatchedExecute = Object.assign(
	executeBatch,
	{ batch: true as const },
);
