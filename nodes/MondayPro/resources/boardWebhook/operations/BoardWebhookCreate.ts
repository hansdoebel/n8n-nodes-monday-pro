import {
	type IExecuteFunctions,
	INodeProperties,
	NodeOperationError,
} from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../GenericFunctions";

export const boardWebhookCreate: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		typeOptions: { loadOptionsMethod: "getBoards" },
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardWebhook"], operation: ["create"] },
		},
		description:
			'Board to subscribe webhooks for. Choose from list or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: "Webhook URL",
		name: "url",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardWebhook"], operation: ["create"] },
		},
		description:
			"Public HTTPS endpoint that will receive Monday webhook POST requests",
	},
	{
		displayName: "Event",
		name: "event",
		type: "options",
		default: "create_item",
		displayOptions: {
			show: { resource: ["boardWebhook"], operation: ["create"] },
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
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: { resource: ["boardWebhook"], operation: ["create"] },
		},
		options: [
			{
				displayName: "Config (JSON)",
				name: "config",
				type: "json",
				typeOptions: { alwaysOpenEditWindow: true },
				default: "",
				description:
					"Optional webhook configuration (for events like change_specific_column_value, etc.)",
			},
		],
	},
];

export async function boardWebhookCreateExecute(
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
	return response.data.create_webhook;
}
