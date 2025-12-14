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
			multipleValueButtonText: "Add Webhook",
		},
		default: {},
		placeholder: "Add Webhook",
		displayOptions: {
			show: { resource: ["boardWebhook"], operation: ["createMany"] },
		},
		description: "Add multiple webhooks to create for this board (maximum 20)",
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
						description: "Which Monday event should trigger this webhook",
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
						required: true,
						description: "The ID of the specific column to monitor for changes",
						placeholder: "columnId",
						displayOptions: {
							show: {
								event: [
									"change_specific_column_value",
									"change_status_column_value",
								],
							},
						},
					},
					{
						displayName: "Column Value (JSON)",
						name: "columnValue",
						type: "string",
						default: '{"index":0}',
						required: true,
						description:
							'The column value to monitor. For status columns, use {"index":0} format. The index varies by column type.',
						placeholder: '{"index":0}',
						displayOptions: {
							show: {
								event: ["change_status_column_value"],
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
		columnValue?: string;
	}>;

	if (!webhooksData || webhooksData.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			"At least one webhook must be defined",
			{ itemIndex: i },
		);
	}

	if (webhooksData.length > 20) {
		throw new NodeOperationError(
			this.getNode(),
			`Too many webhooks defined (${webhooksData.length}). Maximum allowed is 20 per operation.`,
			{ itemIndex: i },
		);
	}

	const mutations: string[] = [];
	const variables: { [key: string]: any } = {};
	const webhookMetadata: Array<{
		alias: string;
		event: string;
		url: string;
		columnId?: string;
	}> = [];

	webhooksData.forEach((webhook, index) => {
		const alias = `webhook${index}`;

		webhookMetadata.push({
			alias,
			event: webhook.event,
			url: webhook.url,
			columnId: webhook.columnId,
		});

		let configValue = null;
		if (webhook.event === "change_specific_column_value") {
			if (webhook.columnId && webhook.columnId.trim() !== "") {
				configValue = {
					columnId: webhook.columnId.trim(),
					columnValue: { "$any$": true },
				};
			}
		} else if (webhook.event === "change_status_column_value") {
			if (webhook.columnId && webhook.columnId.trim() !== "") {
				let parsedColumnValue;
				try {
					parsedColumnValue = JSON.parse(webhook.columnValue || "{}");
				} catch (error) {
					throw new NodeOperationError(
						this.getNode(),
						`Invalid JSON in webhook ${
							index + 1
						} columnValue: ${webhook.columnValue}`,
						{ itemIndex: i },
					);
				}
				configValue = {
					columnId: webhook.columnId.trim(),
					columnValue: parsedColumnValue,
				};
			}
		}

		variables[`boardId${index}`] = boardId;
		variables[`url${index}`] = webhook.url;
		variables[`event${index}`] = webhook.event;
		if (configValue) {
			variables[`config${index}`] = JSON.stringify(configValue);
		}

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

	let response;
	try {
		response = await mondayProApiRequest.call(this, body);
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Failed to create webhooks: ${error.message}`,
			{ itemIndex: i },
		);
	}

	if (response.errors && response.errors.length > 0) {
		const errorMessages = response.errors
			.map((err: any) => err.message)
			.join("; ");
		throw new NodeOperationError(
			this.getNode(),
			`GraphQL errors occurred: ${errorMessages}`,
			{ itemIndex: i },
		);
	}

	const results: Array<{
		success: boolean;
		webhook?: any;
		error?: string;
		metadata: {
			index: number;
			event: string;
			url: string;
			columnId?: string;
		};
	}> = [];

	webhooksData.forEach((webhook, index) => {
		const alias = `webhook${index}`;
		const webhookResult = response.data?.[alias];

		if (webhookResult && webhookResult.id) {
			results.push({
				success: true,
				webhook: webhookResult,
				metadata: {
					index: index + 1,
					event: webhook.event,
					url: webhook.url,
					columnId: webhook.columnId,
				},
			});
		} else {
			results.push({
				success: false,
				error: "Webhook creation returned null or invalid response",
				metadata: {
					index: index + 1,
					event: webhook.event,
					url: webhook.url,
					columnId: webhook.columnId,
				},
			});
		}
	});

	const failedWebhooks = results.filter((r) => !r.success);
	const successfulWebhooks = results.filter((r) => r.success);

	if (failedWebhooks.length > 0) {
		const failureDetails = failedWebhooks
			.map(
				(f) =>
					`Webhook #${f.metadata.index} (${f.metadata.event} - ${f.metadata.url}): ${f.error}`,
			)
			.join("\n");

		if (successfulWebhooks.length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				`All ${failedWebhooks.length} webhooks failed to create:\n${failureDetails}`,
				{ itemIndex: i },
			);
		} else {
			const warningMessage =
				`${successfulWebhooks.length} of ${results.length} webhooks created successfully. ${failedWebhooks.length} failed:\n${failureDetails}`;

			return successfulWebhooks.map((r) => ({
				...r.webhook,
				_warning: warningMessage,
				_partialSuccess: true,
				_successfulCount: successfulWebhooks.length,
				_failedCount: failedWebhooks.length,
			}));
		}
	}

	return successfulWebhooks.map((r) => r.webhook);
}
