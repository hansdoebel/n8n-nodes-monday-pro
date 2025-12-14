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
		displayName: "Webhooks",
		name: "webhooks",
		type: "fixedCollection",
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: "Add Webhook",
		displayOptions: {
			show: { resource: ["boardWebhook"], operation: ["createMany"] },
		},
		description: "Add multiple webhooks to create for this board",
		options: [
			{
				name: "webhook",
				displayName: "Webhook",
				values: [
					{
						displayName: "Event",
						name: "event",
						type: "options",
						default: "create_item",
						required: true,
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
							{
								name: "Item Moved to Any Group",
								value: "item_moved_to_any_group",
							},
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
						displayName: "Webhook URL",
						name: "url",
						type: "string",
						default: "",
						required: true,
						description:
							"Public HTTPS endpoint that will receive Monday webhook POST requests",
					},
					{
						displayName: "Column ID",
						name: "columnId",
						type: "string",
						default: "",
						description:
							"The ID of the specific column to monitor for changes (required for column-specific events)",
						placeholder: "status",
						displayOptions: {
							show: {
								event: [
									"change_specific_column_value",
									"change_status_column_value",
								],
							},
						},
					},
				],
			},
		],
	},
];

export async function boardWebhookCreateManyExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = this.getNodeParameter("boardId", i) as string;
	const webhooksData = this.getNodeParameter(
		"webhooks.webhook",
		i,
		[],
	) as Array<{
		event: string;
		url: string;
		columnId?: string;
	}>;

	if (!webhooksData || webhooksData.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			"At least one webhook must be defined",
			{ itemIndex: i },
		);
	}

	// Build multiple mutations with GraphQL aliases
	const mutations: string[] = [];
	const variables: { [key: string]: any } = {};

	webhooksData.forEach((webhook, index) => {
		const alias = `webhook${index}`;

		// Build config JSON if columnId is provided
		let configValue = null;
		if (webhook.columnId && webhook.columnId.trim() !== "") {
			configValue = { columnId: webhook.columnId.trim() };
		}

		// Add variables for this webhook
		variables[`boardId${index}`] = boardId;
		variables[`url${index}`] = webhook.url;
		variables[`event${index}`] = webhook.event;
		if (configValue) {
			variables[`config${index}`] = JSON.stringify(configValue);
		}

		// Build mutation with alias
		const configParam = configValue ? `, config: $config${index}` : "";
		mutations.push(`
			${alias}: create_webhook (
				board_id: $boardId${index},
				url: $url${index},
				event: $event${index}${configParam}
			) {
				id
				board_id
				event
				config
			}
		`);
	});

	// Build variable definitions for the mutation
	const variableDefinitions: string[] = [];
	webhooksData.forEach((webhook, index) => {
		variableDefinitions.push(`$boardId${index}: ID!`);
		variableDefinitions.push(`$url${index}: String!`);
		variableDefinitions.push(`$event${index}: WebhookEventType!`);
		if (webhook.columnId && webhook.columnId.trim() !== "") {
			variableDefinitions.push(`$config${index}: JSON`);
		}
	});

	const query = `mutation (${variableDefinitions.join(", ")}) {
		${mutations.join("\n")}
	}`;

	const body: IGraphqlBody = {
		query,
		variables,
	};

	const response = await mondayProApiRequest.call(this, body);

	// Extract all webhook results from the response
	const createdWebhooks = webhooksData.map((_, index) => {
		const alias = `webhook${index}`;
		return response.data[alias];
	});

	return createdWebhooks;
}
