import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	extractResourceLocatorValue,
	itemResourceLocator,
} from "../../../utils/resourceLocator";

export const boardItemDelete: INodeProperties[] = [
	itemResourceLocator({
		displayName: "Item",
		name: "itemId",
		required: true,
		description: "The item to delete",
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["delete"] },
		},
	}),
];

export async function boardItemDeleteExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const itemId = extractResourceLocatorValue(
		this.getNodeParameter("itemId", i),
	);

	const body: IGraphqlBody = {
		query: `mutation ($itemId: ID!) {
			delete_item (item_id: $itemId) { id }
		}`,
		variables: { itemId },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.delete_item;
}
