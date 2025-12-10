import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const boardItemGet: INodeProperties[] = [
	{
		displayName: "Item ID",
		name: "itemId",
		type: "string",
		default: "",
		required: true,
		displayOptions: { show: { resource: ["boardItem"], operation: ["get"] } },
		description: "Item ID (multiple can be comma-separated)",
	},
];

export async function boardItemGetExecute(this: IExecuteFunctions, i: number) {
	const itemIds = (this.getNodeParameter("itemId", i) as string)
		.split(",")
		.map((id) => id.trim());

	const body: IGraphqlBody = {
		query: `query ($itemId: [ID!]){
			items (ids: $itemId) {
				id
				name
				created_at
				state
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
			}
		}`,
		variables: { itemId: itemIds },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.items;
}
