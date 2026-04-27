import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	boardResourceLocator,
	extractResourceLocatorValue,
	itemResourceLocator,
} from "../../../utils/resourceLocator";

export const boardItemChangeMultipleColumnValues: INodeProperties[] = [
	boardResourceLocator({
		displayName: "Board",
		name: "boardId",
		required: true,
		description: "The board the item belongs to",
		displayOptions: {
			show: {
				resource: ["boardItem"],
				operation: ["changeMultipleColumnValues"],
			},
		},
	}),
	itemResourceLocator({
		displayName: "Item",
		name: "itemId",
		required: true,
		description: "The item to update",
		displayOptions: {
			show: {
				resource: ["boardItem"],
				operation: ["changeMultipleColumnValues"],
			},
		},
	}),
	{
		displayName: "Column Values (JSON)",
		name: "columnValues",
		type: "json",
		required: true,
		default: "",
		typeOptions: { alwaysOpenEditWindow: true },
		displayOptions: {
			show: {
				resource: ["boardItem"],
				operation: ["changeMultipleColumnValues"],
			},
		},
	},
];

export async function boardItemChangeMultipleColumnValuesExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = extractResourceLocatorValue(
		this.getNodeParameter("boardId", i),
	);
	const itemId = extractResourceLocatorValue(
		this.getNodeParameter("itemId", i),
	);
	const columnValues = this.getNodeParameter("columnValues", i) as string;

	try {
		JSON.parse(columnValues);
	} catch {
		throw new NodeOperationError(
			this.getNode(),
			"Column Values must be valid JSON",
			{ itemIndex: i },
		);
	}

	const body: IGraphqlBody = {
		query: `mutation (
			$boardId: ID!, $itemId: ID!, $columnValues: JSON!
		) {
			change_multiple_column_values (
				board_id: $boardId, item_id: $itemId, column_values: $columnValues
			) { id }
		}`,
		variables: {
			boardId,
			itemId,
			columnValues: JSON.stringify(JSON.parse(columnValues)),
		},
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.change_multiple_column_values;
}
