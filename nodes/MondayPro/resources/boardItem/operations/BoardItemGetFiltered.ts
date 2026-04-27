import {
	type IExecuteFunctions,
	INodeProperties,
	NodeOperationError, IDataObject
} from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import {
	jsonToGraphqlFields,
	mondayProApiPaginatedRequest,
	mondayProApiRequest,
} from "../../../utils/GenericFunctions";
import {
	boardResourceLocator,
	extractResourceLocatorValue,
} from "../../../utils/resourceLocator";

export const boardItemGetFiltered: INodeProperties[] = [
	boardResourceLocator({
		displayName: "Board",
		name: "boardId",
		required: true,
		description:
			"The board to search in. Use \"By ID\" mode for comma-separated IDs to query multiple boards.",
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["getFiltered"] },
		},
	}),
	{
		displayName: "Return All",
		name: "returnAll",
		type: "boolean",
		default: true,
		description: "Whether to return all results or only up to a given limit",
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["getFiltered"] },
		},
	},
	{
		displayName: "Limit",
		name: "limit",
		type: "number",
		description: "Max number of results to return",
		typeOptions: { minValue: 1 },
		default: 50,
		displayOptions: {
			show: {
				resource: ["boardItem"],
				operation: ["getFiltered"],
				returnAll: [false],
			},
		},
	},
	{
		displayName: "Query Parameters (JSON)",
		name: "queryParams",
		type: "json",
		typeOptions: { alwaysOpenEditWindow: true },
		default: "",
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["getFiltered"] },
		},
	},
	{
		displayName: "Fields JSON",
		name: "fieldsJson",
		type: "json",
		typeOptions: { alwaysOpenEditWindow: true },
		default: "",
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["getFiltered"] },
		},
	},
];

export async function boardItemGetFilteredExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const rawBoardId = extractResourceLocatorValue(
		this.getNodeParameter("boardId", i),
	);
	const boardIds = rawBoardId
		.split(",")
		.map((id) => id.trim())
		.filter(Boolean);

	const returnAll = this.getNodeParameter("returnAll", i) as boolean;
	const fieldsJson = this.getNodeParameter("fieldsJson", i, "") as string;
	const queryParamsJson = this.getNodeParameter("queryParams", i, "") as string;

	let fieldsToReturn = "{ id }";

	if (fieldsJson) {
		try {
			const parsed = JSON.parse(fieldsJson) as IDataObject;
			fieldsToReturn = jsonToGraphqlFields(parsed);
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				"Fields JSON must be valid JSON",
				{ itemIndex: i },
			);
		}
	}

	let queryParams: IDataObject | undefined;
	if (queryParamsJson) {
		try {
			queryParams = JSON.parse(queryParamsJson) as IDataObject;
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				"Query Parameters must be valid JSON",
				{ itemIndex: i },
			);
		}
	}

	const limit = returnAll ? 500 : (this.getNodeParameter("limit", i) as number);

	const body: IGraphqlBody = {
		query: `query ($boardId: [ID!], $limit: Int, $queryParams: ItemsQuery) {
			boards(ids: $boardId) {
				items_page(limit: $limit, query_params: $queryParams) {
					cursor
					items ${fieldsToReturn}
				}
			}
		}`,
		variables: {
			boardId: boardIds,
			limit,
			...(queryParams && { queryParams }),
		},
	};

	if (returnAll) {
		return await mondayProApiPaginatedRequest.call(
			this,
			"data.boards[0].items_page",
			fieldsToReturn,
			body,
		);
	}

	const response = await mondayProApiRequest.call(this, body);
	return response.data.boards[0].items_page.items;
}
