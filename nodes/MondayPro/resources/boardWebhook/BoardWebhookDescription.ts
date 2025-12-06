import type { INodeProperties } from "n8n-workflow";
import * as operations from "./operations";

export const boardWebhookOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["boardWebhook"],
			},
		},
		options: [
			{
				name: "Create",
				value: "create",
				action: "Create webhook",
				description:
					"Create a webhook for a board to receive events at a custom URL",
			},
			{
				name: "Delete",
				value: "delete",
				action: "Delete webhook",
				description: "Delete an existing webhook by its ID",
			},
			{
				name: "Get Many",
				value: "getAll",
				action: "Get webhooks",
				description: "List webhooks created on a board",
			},
		],
		default: "create",
	},
];

const boardWebhookFieldArrays = Object.values(operations).filter(
	(v): v is INodeProperties[] => Array.isArray(v),
);

export const boardWebhookDescription: INodeProperties[] = [
	...boardWebhookOperations,
	...boardWebhookFieldArrays.flat(),
];
