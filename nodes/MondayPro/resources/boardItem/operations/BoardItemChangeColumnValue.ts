import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import type { IGraphqlBody } from "@types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const boardItemChangeColumnValue: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: { loadOptionsMethod: "getBoards" },
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["changeColumnValue"] },
		},
	},
	{
		displayName: "Item ID",
		name: "itemId",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["changeColumnValue"] },
		},
	},
	{
		displayName: "Column Name or ID",
		name: "columnId",
		type: "options",
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsMethod: "getColumns",
			loadOptionsDependsOn: ["boardId"],
		},
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["changeColumnValue"] },
		},
	},
	{
		displayName: "Value (JSON)",
		name: "value",
		type: "json",
		required: true,
		default: "",
		typeOptions: { alwaysOpenEditWindow: true },
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["changeColumnValue"] },
		},
	},
];

export async function boardItemChangeColumnValueExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = this.getNodeParameter("boardId", i);
	const itemId = this.getNodeParameter("itemId", i);
	const columnId = this.getNodeParameter("columnId", i) as string;
	const value = this.getNodeParameter("value", i) as string;

	try {
		JSON.parse(value);
	} catch {
		throw new NodeOperationError(this.getNode(), "Value must be valid JSON", {
			itemIndex: i,
		});
	}

	const body: IGraphqlBody = {
		query: `mutation (
			$boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!
		) {
			change_column_value (
				board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value
			) { id }
		}`,
		variables: {
			boardId,
			itemId,
			columnId,
			value: JSON.stringify(JSON.parse(value)),
		},
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.change_column_value;
}
