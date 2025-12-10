import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "@types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const boardWebhookDelete: INodeProperties[] = [
	{
		displayName: "Webhook ID",
		name: "webhookId",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardWebhook"], operation: ["delete"] },
		},
		description: "The ID of the webhook to delete",
	},
];

export async function boardWebhookDeleteExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const webhookId = this.getNodeParameter("webhookId", i) as string;

	const body: IGraphqlBody = {
		query: `mutation ($webhookId: ID!) {
			delete_webhook (id: $webhookId) {
				id
			}
		}`,
		variables: { webhookId },
	};
	const response = await mondayProApiRequest.call(this, body);
	return response.data.delete_webhook;
}
