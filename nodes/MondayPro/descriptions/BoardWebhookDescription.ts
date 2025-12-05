import type { INodeProperties } from "n8n-workflow";

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

export const boardWebhookFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                               boardWebhook:create                          */
	/* -------------------------------------------------------------------------- */
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getBoards",
		},
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["boardWebhook"],
				operation: ["create", "getAll"],
			},
		},
		description:
			"Board to subscribe webhooks for. Choose from the list, or specify an ID using an expression.",
	},
	{
		displayName: "Webhook URL",
		name: "url",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["boardWebhook"],
				operation: ["create"],
			},
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
			show: {
				resource: ["boardWebhook"],
				operation: ["create"],
			},
		},
		options: [
			{ name: "Create Item", value: "create_item" },
			{ name: "Create Subitem", value: "create_subitem" },
			{ name: "Change Column Value", value: "change_column_value" },
			{
				name: "Change Status Column Value",
				value: "change_status_column_value",
			},
			{
				name: "Change Subitem Column Value",
				value: "change_subitem_column_value",
			},
			{
				name: "Change Specific Column Value",
				value: "change_specific_column_value",
			},
			{ name: "Change Item Name", value: "change_name" },
			{ name: "Item Archived", value: "item_archived" },
			{ name: "Item Deleted", value: "item_deleted" },
			{ name: "Item Moved to Any Group", value: "item_moved_to_any_group" },
			{
				name: "Item Moved to Specific Group",
				value: "item_moved_to_specific_group",
			},
			{ name: "Item Restored", value: "item_restored" },
			{ name: "Change Subitem Name", value: "change_subitem_name" },
			{ name: "Move Subitem", value: "move_subitem" },
			{ name: "Subitem Archived", value: "subitem_archived" },
			{ name: "Subitem Deleted", value: "subitem_deleted" },
			{ name: "Create Column", value: "create_column" },
			{ name: "Create Update", value: "create_update" },
			{ name: "Edit Update", value: "edit_update" },
			{ name: "Delete Update", value: "delete_update" },
			{ name: "Create Subitem Update", value: "create_subitem_update" },
		],
		description:
			"Which Monday event should trigger this webhook (see Monday Webhooks documentation)",
	},
	{
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: {
				resource: ["boardWebhook"],
				operation: ["create"],
			},
		},
		options: [
			{
				displayName: "Config (JSON)",
				name: "config",
				type: "json",
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				default: "",
				description:
					"Optional webhook configuration (for events like change_specific_column_value, change_status_column_value, etc.)",
			},
		],
	},
	/* -------------------------------------------------------------------------- */
	/*                               boardWebhook:getAll                          */
	/* -------------------------------------------------------------------------- */
	{
		displayName: "Return All",
		name: "returnAll",
		type: "boolean",
		default: true,
		displayOptions: {
			show: {
				resource: ["boardWebhook"],
				operation: ["getAll"],
			},
		},
		description:
			"Whether to return all webhooks or limit the number of results",
	},
	{
		displayName: "Limit",
		name: "limit",
		type: "number",
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 200,
		},
		displayOptions: {
			show: {
				resource: ["boardWebhook"],
				operation: ["getAll"],
				returnAll: [false],
			},
		},
		description: "Max number of webhooks to return",
	},

	/* -------------------------------------------------------------------------- */
	/*                               boardWebhook:delete                          */
	/* -------------------------------------------------------------------------- */
	{
		displayName: "Webhook ID",
		name: "webhookId",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["boardWebhook"],
				operation: ["delete"],
			},
		},
		description: "The ID of the webhook to delete",
	},
];
