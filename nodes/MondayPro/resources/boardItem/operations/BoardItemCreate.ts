import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import {
	buildItemFieldsGraphQL,
	mondayProApiRequest,
} from "../../../GenericFunctions";

export const boardItemCreate: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: { loadOptionsMethod: "getBoards" },
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["create"] },
		},
	},
	{
		displayName: "Group Name or ID",
		name: "groupId",
		type: "options",
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsMethod: "getGroups",
			loadOptionsDependsOn: ["boardId"],
		},
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["create"] },
		},
	},
	{
		displayName: "Name",
		name: "name",
		type: "string",
		required: true,
		default: "",
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["create"] },
		},
		description: "The new item's name",
	},
	{
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["create"] },
		},
		options: [
			{
				displayName: "Column Values (JSON)",
				name: "columnValues",
				type: "json",
				typeOptions: { alwaysOpenEditWindow: true },
				default: "",
				displayOptions: { show: { mode: ["advanced"] } },
				description: "Manual JSON for column values",
			},
			{
				displayName: "Column Values (Simple)",
				name: "columnValuesUi",
				type: "fixedCollection",
				typeOptions: { multipleValues: true },
				default: {},
				displayOptions: { show: { mode: ["simple"] } },
				placeholder: "Add Column Value",
				description: "Set column values for the new item",
				options: [
					{
						name: "columns",
						displayName: "Column",
						values: [
							{
								displayName: "Column Name or ID",
								name: "columnId",
								type: "options",
								typeOptions: {
									loadOptionsMethod: "getColumns",
									loadOptionsDependsOn: ["boardId"],
								},
								default: "",
								description:
									'Select a column from the board. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: "Value",
								name: "value",
								type: "string",
								default: "",
								description: "Value for this column",
							},
						],
					},
				],
			},
			{
				displayName: "Mode",
				name: "mode",
				type: "options",
				default: "simple",
				options: [
					{
						name: "Advanced (JSON)",
						value: "advanced",
						description: "Manually specify JSON for full control",
					},
					{
						name: "Simple",
						value: "simple",
						description: "Select columns and values using UI fields",
					},
				],
			},
			{
				displayName: "Return Column IDs",
				name: "returnColumnIds",
				type: "string",
				default: "",
				description: "Comma-separated list of column IDs to include in return",
			},
			{
				displayName: "Return Fields (JSON)",
				name: "returnFieldsJson",
				type: "json",
				typeOptions: { alwaysOpenEditWindow: true },
				default: "",
				description: "Standard fields to include in the response",
			},
		],
	},
];

export async function boardItemCreateExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = this.getNodeParameter("boardId", i);
	const groupId = this.getNodeParameter("groupId", i);
	const itemName = this.getNodeParameter("name", i);
	const additionalFields = this.getNodeParameter(
		"additionalFields",
		i,
		{},
	) as any;
	const mode = additionalFields.mode || "simple";

	let columnValuesObj: Record<string, any> = {};

	if (mode === "simple" && additionalFields.columnValuesUi) {
		const columns = (additionalFields.columnValuesUi as any).columns as any[];
		if (Array.isArray(columns)) {
			for (const col of columns) {
				if (col.columnId && col.value) {
					columnValuesObj[col.columnId] = col.value;
				}
			}
		}
	}

	if (mode === "advanced" && additionalFields.columnValues) {
		columnValuesObj = JSON.parse(additionalFields.columnValues as string);
	}

	let fieldSelection = "id";

	if (additionalFields.returnFieldsJson) {
		fieldSelection = buildItemFieldsGraphQL(additionalFields.returnFieldsJson);
	}

	if (additionalFields.returnColumnIds) {
		const ids = (additionalFields.returnColumnIds as string)
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		if (ids.length) {
			fieldSelection += `
column_values(ids: ["${ids.join('","')}"]) {
  text
  column { title }
}`;
		}
	}

	const body: IGraphqlBody = {
		query: `
			mutation (
				$boardId: ID!,
				$groupId: String!,
				$itemName: String!,
				$columnValues: JSON
			) {
				create_item(
					board_id: $boardId,
					group_id: $groupId,
					item_name: $itemName,
					column_values: $columnValues,
					create_labels_if_missing: true
				) {
					${fieldSelection}
				}
			}
		`,
		variables: {
			boardId,
			groupId,
			itemName,
			columnValues: JSON.stringify(columnValuesObj),
		},
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.create_item;
}
