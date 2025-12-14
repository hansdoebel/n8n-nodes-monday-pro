import {
	type IExecuteFunctions,
	INodeProperties,
	NodeOperationError,
} from "n8n-workflow";
import type { IGraphqlBody } from "@types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const boardWebhookCreateMany: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		typeOptions: { loadOptionsMethod: "getBoards" },
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardWebhook"], operation: ["createMany"] },
		},
		description:
			'Board to subscribe webhooks for. Choose from list or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: "Event",
		name: "event",
		type: "options",
		default: "create_item",
		required: true,
		displayOptions: {
			show: { resource: ["boardWebhook"], operation: ["createMany"] },
		},
		description:
			"Which Monday event should trigger this webhook (see Monday Webhooks docs)",
		options: [
			{ name: "Change Column Value", value: "change_column_value" },
			{ name: "Change Item Name", value: "change_name" },
			{
				name: "Change Specific Column Value",
				value: "change_specific_column_value",
			},
			{
				name: "Change Status Column Value",
				value: "change_status_column_value",
			},
			{
				name: "Change Subitem Column Value",
				value: "change_subitem_column_value",
			},
			{ name: "Change Subitem Name", value: "change_subitem_name" },
			{ name: "Create Column", value: "create_column" },
			{ name: "Create Item", value: "create_item" },
			{ name: "Create Subitem", value: "create_subitem" },
			{ name: "Create Subitem Update", value: "create_subitem_update" },
			{ name: "Create Update", value: "create_update" },
			{ name: "Delete Update", value: "delete_update" },
			{ name: "Edit Update", value: "edit_update" },
			{ name: "Item Archived", value: "item_archived" },
			{ name: "Item Deleted", value: "item_deleted" },
			{ name: "Item Moved to Any Group", value: "item_moved_to_any_group" },
			{
				name: "Item Moved to Specific Group",
				value: "item_moved_to_specific_group",
			},
			{ name: "Item Restored", value: "item_restored" },
			{ name: "Move Subitem", value: "move_subitem" },
			{ name: "Subitem Archived", value: "subitem_archived" },
			{ name: "Subitem Deleted", value: "subitem_deleted" },
		],
	},
	{
		displayName: "Column ID",
		name: "columnValue",
		type: "string",
		default: "",
		description: "",
		required: true,
	},
	{
		displayName: "Column Value",
		name: "columnValue",
		type: "string",
		required: true,
		default: "",
		description: "",
	},
	{
		displayName: "Webhook URL",
		name: "url",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardWebhook"], operation: ["createMany"] },
		},
		description:
			"Public HTTPS endpoint that will receive Monday webhook POST requests",
	},
	{
		displayName: "Additional Webhooks",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Webhook",
		default: {},
		displayOptions: {
			show: {
				resource: ["boardWebhook"],
				operation: ["createMany"],
			},
		},
		options: [
			{
				displayName: "Column ID",
				name: "columnValue",
				type: "string",
				default: "",
				description: "",
			},
			{
				displayName: "Column Value",
				name: "columnValue",
				type: "string",
				default: "",
				description: "",
			},
			{
				displayName: "Webhook URL",
				name: "url",
				type: "string",
				default: "",
				description:
					"Public HTTPS endpoint that will receive Monday webhook POST requests",
			},
		],
	},
];

export async function boardWebhookCreateManyExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = this.getNodeParameter("boardId", i);
	const url = this.getNodeParameter("url", i) as string;
	const event = this.getNodeParameter("event", i) as string;
	const additionalFields = this.getNodeParameter("additionalFields", i, {}) as {
		config?: string;
	};

	const body: IGraphqlBody = {
		query:
			`mutation ($boardId: ID!, $url: String!, $event: WebhookEventType!, $config: JSON) {
			create_webhook (
				board_id: $boardId,
				url: $url,
				event: $event,
				config: $config
			) {
				id
				board_id
				event
				config
			}
		}`,
		variables: { boardId, url, event },
	};

	if (additionalFields.config) {
		try {
			JSON.parse(additionalFields.config);
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				"Config must be valid JSON",
				{ itemIndex: i },
			);
		}
		body.variables.config = JSON.stringify(JSON.parse(additionalFields.config));
	}

	const response = await mondayProApiRequest.call(this, body);
	return response.data.createMany_webhook;
}
