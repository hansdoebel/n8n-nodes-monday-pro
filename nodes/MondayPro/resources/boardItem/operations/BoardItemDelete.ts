import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const boardItemDelete: INodeProperties[] = [
	{
		displayName: "Item ID",
		name: "itemId",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["delete"] },
		},
	},
];

export async function boardItemDeleteExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const itemId = this.getNodeParameter("itemId", i);

	const body: IGraphqlBody = {
		query: `mutation ($itemId: ID!) {
			delete_item (item_id: $itemId) { id }
		}`,
		variables: { itemId },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.delete_item;
}
