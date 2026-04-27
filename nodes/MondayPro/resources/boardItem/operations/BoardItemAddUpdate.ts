import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	extractResourceLocatorValue,
	itemResourceLocator,
} from "../../../utils/resourceLocator";

export const boardItemAddUpdate: INodeProperties[] = [
	itemResourceLocator({
		displayName: "Item",
		name: "itemId",
		required: true,
		description: "The item to add the update to",
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["addUpdate"] },
		},
	}),
	{
		displayName: "Update Text",
		name: "value",
		type: "string",
		required: true,
		default: "",
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["addUpdate"] },
		},
		description: "The update text to add",
	},
];

export async function boardItemAddUpdateExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const itemId = extractResourceLocatorValue(
		this.getNodeParameter("itemId", i),
	);
	const value = this.getNodeParameter("value", i) as string;

	const body: IGraphqlBody = {
		query: `mutation ($itemId: ID!, $value: String!) {
			create_update (item_id: $itemId, body: $value) { id }
		}`,
		variables: { itemId, value },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.create_update;
}
