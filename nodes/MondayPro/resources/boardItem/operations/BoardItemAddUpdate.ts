import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../GenericFunctions";

export const boardItemAddUpdate: INodeProperties[] = [
	{
		displayName: "Item ID",
		name: "itemId",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["addUpdate"] },
		},
		description: "The unique identifier of the item to add update to",
	},
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
	const itemId = this.getNodeParameter("itemId", i);
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
