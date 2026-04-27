import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	boardResourceLocator,
	columnResourceLocator,
	extractResourceLocatorValue,
	itemResourceLocator,
} from "../../../utils/resourceLocator";

export const boardItemChangeColumnValue: INodeProperties[] = [
	boardResourceLocator({
		displayName: "Board",
		name: "boardId",
		required: true,
		description: "The board the item belongs to",
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["changeColumnValue"] },
		},
	}),
	itemResourceLocator({
		displayName: "Item",
		name: "itemId",
		required: true,
		description: "The item to update",
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["changeColumnValue"] },
		},
	}),
	columnResourceLocator({
		displayName: "Column",
		name: "columnId",
		required: true,
		description: "The column to change",
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["changeColumnValue"] },
		},
	}),
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
	const boardId = extractResourceLocatorValue(
		this.getNodeParameter("boardId", i),
	);
	const itemId = extractResourceLocatorValue(
		this.getNodeParameter("itemId", i),
	);
	const columnId = extractResourceLocatorValue(
		this.getNodeParameter("columnId", i),
	);
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
