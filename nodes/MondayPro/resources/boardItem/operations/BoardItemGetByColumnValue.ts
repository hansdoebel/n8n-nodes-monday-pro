import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import {
	mondayProApiPaginatedRequest,
	mondayProApiRequest,
} from "../../../utils/GenericFunctions";
import {
	boardResourceLocator,
	columnResourceLocator,
	extractResourceLocatorValue,
} from "../../../utils/resourceLocator";

export const boardItemGetByColumnValue: INodeProperties[] = [
	boardResourceLocator({
		displayName: "Board",
		name: "boardId",
		required: true,
		description: "The board to search in",
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["getByColumnValue"] },
		},
	}),
	columnResourceLocator({
		displayName: "Column",
		name: "columnId",
		required: true,
		description: "The column to filter by",
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["getByColumnValue"] },
		},
	}),
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
	const boardId = extractResourceLocatorValue(
		this.getNodeParameter("boardId", i),
	);
	const columnId = extractResourceLocatorValue(
		this.getNodeParameter("columnId", i),
	);
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
