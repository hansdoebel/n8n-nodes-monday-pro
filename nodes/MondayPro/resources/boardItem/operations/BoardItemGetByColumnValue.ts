import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import {
	mondayProApiPaginatedRequest,
	mondayProApiRequest,
} from "../../../GenericFunctions";

export const boardItemGetByColumnValue: INodeProperties[] = [
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
			show: { resource: ["boardItem"], operation: ["getByColumnValue"] },
		},
	},
	{
		displayName: "Column Name or ID",
		name: "columnId",
		type: "options",
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsMethod: "getColumns",
			loadOptionsDependsOn: ["boardId"],
		},
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["getByColumnValue"] },
		},
	},
	{
		displayName: "Column Value",
		name: "columnValue",
		type: "string",
		required: true,
		default: "",
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["getByColumnValue"] },
		},
	},
	{
		displayName: "Return All",
		name: "returnAll",
		type: "boolean",
		description: "Whether to return all results or only up to a given limit",
		default: false,
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["getByColumnValue"] },
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
				operation: ["getByColumnValue"],
				returnAll: [false],
			},
		},
	},
];

export async function boardItemGetByColumnValueExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = this.getNodeParameter("boardId", i);
	const columnId = this.getNodeParameter("columnId", i) as string;
	const columnValue = this.getNodeParameter("columnValue", i) as string;
	const returnAll = this.getNodeParameter("returnAll", i);

	const fieldsToReturn = `{
		id
		name
		created_at
		state
		board { id }
		column_values {
			id
			text
			type
			value
			column {
				title
				archived
				description
				settings_str
			}
		}
	}`;

	const body: IGraphqlBody = {
		query:
			`query ($boardId: ID!, $columnId: String!, $columnValue: String!, $limit: Int) {
			items_page_by_column_values(
				limit: $limit
				board_id: $boardId
				columns: [{column_id: $columnId, column_values: [$columnValue]}]
			) {
				cursor
				items ${fieldsToReturn}
			}
		}`,
		variables: { boardId, columnId, columnValue, limit: 100 },
	};

	if (returnAll) {
		return await mondayProApiPaginatedRequest.call(
			this,
			"data.items_page_by_column_values",
			fieldsToReturn,
			body,
		);
	}

	body.variables.limit = this.getNodeParameter("limit", i);
	const response = await mondayProApiRequest.call(this, body);
	return response.data.items_page_by_column_values.items;
}
