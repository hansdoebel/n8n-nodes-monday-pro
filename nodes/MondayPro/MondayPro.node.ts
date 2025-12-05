import { snakeCase } from "change-case";
import { NodeConnectionTypes, NodeOperationError } from "n8n-workflow";
import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from "n8n-workflow";

import {
	boardColumnFields,
	boardColumnOperations,
} from "./descriptions/BoardColumnDescription";
import { boardFields, boardOperations } from "./descriptions/BoardDescription";
import {
	boardGroupFields,
	boardGroupOperations,
} from "./descriptions/BoardGroupDescription";
import {
	boardItemFields,
	boardItemOperations,
} from "./descriptions/BoardItemDescription";
import {
	boardSubitemFields,
	boardSubitemOperations,
} from "./descriptions/BoardSubitemDescription";
import {
	boardWebhookFields,
	boardWebhookOperations,
} from "./descriptions/BoardWebhookDescription";

import {
	mondayProApiPaginatedRequest,
	mondayProApiRequest,
	mondayProApiRequestAllItems,
} from "./GenericFunctions";

interface IGraphqlBody {
	query: string;
	variables: IDataObject;
}

export class MondayPro implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Monday.com (Pro)",
		name: "mondayPro",
		icon: "file:mondayPro.svg",
		group: ["output"],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: "Consume Monday.com API",
		defaults: {
			name: "Monday.com (Pro)",
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: "mondayProApi",
				required: true,
				displayOptions: {
					show: {
						authentication: ["accessToken"],
					},
				},
			},
			{
				name: "mondayProOAuth2Api",
				required: true,
				displayOptions: {
					show: {
						authentication: ["oAuth2"],
					},
				},
			},
		],
		properties: [
			{
				displayName: "Authentication",
				name: "authentication",
				type: "options",
				options: [
					{
						name: "Access Token",
						value: "accessToken",
					},
					{
						name: "OAuth2",
						value: "oAuth2",
					},
				],
				default: "accessToken",
			},
			{
				displayName: "Resource",
				name: "resource",
				type: "options",
				noDataExpression: true,
				options: [
					{
						name: "Board",
						value: "board",
					},
					{
						name: "Board Column",
						value: "boardColumn",
					},
					{
						name: "Board Group",
						value: "boardGroup",
					},
					{
						name: "Board Item",
						value: "boardItem",
					},
					{
						name: "Board Subitem",
						value: "boardSubitem",
					},
					{
						name: "Board Webhook",
						value: "boardWebhook",
					},
				],
				default: "board",
			},
			//BOARD
			...boardOperations,
			...boardFields,
			// BOARD COLUMN
			...boardColumnOperations,
			...boardColumnFields,
			// BOARD GROUP
			...boardGroupOperations,
			...boardGroupFields,
			// BOARD ITEM
			...boardItemOperations,
			...boardItemFields,
			// BOARD SUBITEM
			...boardSubitemOperations,
			...boardSubitemFields,
			// BOARD WEBHOOK
			...boardWebhookOperations,
			...boardWebhookFields,
		],
	};

	methods = {
		loadOptions: {
			async getBoards(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const body = {
					query: `query ($page: Int, $limit: Int) {
							boards (page: $page, limit: $limit){
								id
								description
								name
							}
						}`,
					variables: {
						page: 1,
					},
				};
				const boards = await mondayProApiRequestAllItems.call(
					this,
					"data.boards",
					body,
				);
				if (boards === undefined) {
					return returnData;
				}

				for (const board of boards) {
					const boardName = board.name;
					const boardId = board.id;
					const boardDescription = board.description;
					returnData.push({
						name: boardName,
						value: boardId,
						description: boardDescription,
					});
				}
				return returnData;
			},

			async getColumns(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const boardId = this.getCurrentNodeParameter("boardId") as string;
				const body: IGraphqlBody = {
					query: `query ($boardId: [ID!]) {
							boards (ids: $boardId){
								columns {
									id
									title
								}
							}
						}`,
					variables: {
						boardId,
					},
				};
				const { data } = await mondayProApiRequest.call(this, body);
				if (data === undefined) {
					return returnData;
				}

				const columns = data.boards[0].columns;
				for (const column of columns) {
					const columnName = column.title;
					const columnId = column.id;
					returnData.push({
						name: columnName,
						value: columnId,
					});
				}
				return returnData;
			},
			async getGroups(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const boardId = this.getCurrentNodeParameter("boardId") as string;
				const body = {
					query: `query ($boardId: ID!) {
							boards ( ids: [$boardId]){
								groups {
									id
									title
								}
							}
						}`,
					variables: {
						boardId,
					},
				};
				const { data } = await mondayProApiRequest.call(this, body);
				if (data === undefined) {
					return returnData;
				}

				const groups = data.boards[0].groups;
				for (const group of groups) {
					const groupName = group.title;
					const groupId = group.id;
					returnData.push({
						name: groupName,
						value: groupId,
					});
				}
				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let responseData;
		const resource = this.getNodeParameter("resource", 0);
		const operation = this.getNodeParameter("operation", 0);
		for (let i = 0; i < length; i++) {
			try {
				if (resource === "board") {
					if (operation === "archive") {
						const boardId = this.getNodeParameter("boardId", i);

						const body: IGraphqlBody = {
							query: `mutation ($id: ID!) {
									archive_board (board_id: $id) {
										id
									}
								}`,
							variables: {
								id: boardId,
							},
						};

						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.archive_board;
					}
					if (operation === "create") {
						const name = this.getNodeParameter("name", i) as string;
						const kind = this.getNodeParameter("kind", i) as string;
						const additionalFields = this.getNodeParameter(
							"additionalFields",
							i,
						);

						const body: IGraphqlBody = {
							query:
								`mutation ($name: String!, $kind: BoardKind!, $templateId: ID) {
									create_board (board_name: $name, board_kind: $kind, template_id: $templateId) {
										id
									}
								}`,
							variables: {
								name,
								kind,
							},
						};

						if (additionalFields.templateId) {
							body.variables.templateId = additionalFields.templateId as number;
						}

						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.create_board;
					}
					if (operation === "get") {
						const boardId = this.getNodeParameter("boardId", i);

						const body: IGraphqlBody = {
							query: `query ($id: [ID!]) {
									boards (ids: $id){
										id
										name
										description
										state
										board_folder_id
										board_kind
										owners {
											id
										}
									}
								}`,
							variables: {
								id: boardId,
							},
						};

						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.boards;
					}
					if (operation === "getAll") {
						const returnAll = this.getNodeParameter("returnAll", i);

						const body: IGraphqlBody = {
							query: `query ($page: Int, $limit: Int) {
									boards (page: $page, limit: $limit){
										id
										name
										description
										state
										board_folder_id
										board_kind
										owners {
											id
										}
									}
								}`,
							variables: {
								page: 1,
							},
						};

						if (returnAll) {
							responseData = await mondayProApiRequestAllItems.call(
								this,
								"data.boards",
								body,
							);
						} else {
							body.variables.limit = this.getNodeParameter("limit", i);
							responseData = await mondayProApiRequest.call(this, body);
							responseData = responseData.data.boards;
						}
					}
				}
				if (resource === "boardColumn") {
					if (operation === "create") {
						const boardId = this.getNodeParameter("boardId", i);
						const title = this.getNodeParameter("title", i) as string;
						const columnType = this.getNodeParameter("columnType", i) as string;
						const additionalFields = this.getNodeParameter(
							"additionalFields",
							i,
						);

						const body: IGraphqlBody = {
							query:
								`mutation ($boardId: ID!, $title: String!, $columnType: ColumnType!, $defaults: JSON ) {
									create_column (board_id: $boardId, title: $title, column_type: $columnType, defaults: $defaults) {
										id
									}
								}`,
							variables: {
								boardId,
								title,
								columnType: snakeCase(columnType),
							},
						};

						if (additionalFields.defaults) {
							try {
								JSON.parse(additionalFields.defaults as string);
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									"Defauls must be a valid JSON",
									{
										itemIndex: i,
									},
								);
							}
							body.variables.defaults = JSON.stringify(
								JSON.parse(additionalFields.defaults as string),
							);
						}

						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.create_column;
					}
					if (operation === "getAll") {
						const boardId = this.getNodeParameter("boardId", i);

						const body: IGraphqlBody = {
							query: `query ($boardId: [ID!]) {
									boards (ids: $boardId){
										columns {
											id
											title
											type
											settings_str
											archived
										}
									}
								}`,
							variables: {
								page: 1,
								boardId,
							},
						};

						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.boards[0].columns;
					}
				}
				if (resource === "boardGroup") {
					if (operation === "create") {
						const boardId = this.getNodeParameter("boardId", i);
						const name = this.getNodeParameter("name", i) as string;

						const body: IGraphqlBody = {
							query: `mutation ($boardId: ID!, $groupName: String!) {
									create_group (board_id: $boardId, group_name: $groupName) {
										id
									}
								}`,
							variables: {
								boardId,
								groupName: name,
							},
						};

						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.create_group;
					}
					if (operation === "delete") {
						const boardId = this.getNodeParameter("boardId", i);
						const groupId = this.getNodeParameter("groupId", i) as string;

						const body: IGraphqlBody = {
							query: `mutation ($boardId: ID!, $groupId: String!) {
									delete_group (board_id: $boardId, group_id: $groupId) {
										id
									}
								}`,
							variables: {
								boardId,
								groupId,
							},
						};

						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.delete_group;
					}
					if (operation === "getAll") {
						const boardId = this.getNodeParameter("boardId", i);

						const body: IGraphqlBody = {
							query: `query ($boardId: [ID!]) {
									boards (ids: $boardId, ){
										id
										groups {
											id
											title
											color
											position
											archived
										}
									}
								}`,
							variables: {
								boardId,
							},
						};

						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.boards[0].groups;
					}
				}
				if (resource === "boardItem") {
					if (operation === "addUpdate") {
						const itemId = this.getNodeParameter("itemId", i);
						const value = this.getNodeParameter("value", i) as string;

						const body: IGraphqlBody = {
							query: `mutation ($itemId: ID!, $value: String!) {
									create_update (item_id: $itemId, body: $value) {
										id
									}
								}`,
							variables: {
								itemId,
								value,
							},
						};

						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.create_update;
					}
					if (operation === "changeColumnValue") {
						const boardId = this.getNodeParameter("boardId", i);
						const itemId = this.getNodeParameter("itemId", i);
						const columnId = this.getNodeParameter("columnId", i) as string;
						const value = this.getNodeParameter("value", i) as string;

						const body: IGraphqlBody = {
							query:
								`mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
									change_column_value (board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) {
										id
									}
								}`,
							variables: {
								boardId,
								itemId,
								columnId,
							},
						};

						try {
							JSON.parse(value);
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								"Custom Values must be a valid JSON",
								{
									itemIndex: i,
								},
							);
						}
						body.variables.value = JSON.stringify(JSON.parse(value));

						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.change_column_value;
					}
					if (operation === "changeMultipleColumnValues") {
						const boardId = this.getNodeParameter("boardId", i);
						const itemId = this.getNodeParameter("itemId", i);
						const columnValues = this.getNodeParameter(
							"columnValues",
							i,
						) as string;

						const body: IGraphqlBody = {
							query:
								`mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
									change_multiple_column_values (board_id: $boardId, item_id: $itemId, column_values: $columnValues) {
										id
									}
								}`,
							variables: {
								boardId,
								itemId,
							},
						};

						try {
							JSON.parse(columnValues);
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								"Custom Values must be a valid JSON",
								{
									itemIndex: i,
								},
							);
						}
						body.variables.columnValues = JSON.stringify(
							JSON.parse(columnValues),
						);

						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.change_multiple_column_values;
					}
					if (operation === "create") {
						const boardId = this.getNodeParameter("boardId", i);
						const groupId = this.getNodeParameter("groupId", i) as string;
						const itemName = this.getNodeParameter("name", i) as string;
						const additionalFields = this.getNodeParameter(
							"additionalFields",
							i,
						);

						const body: IGraphqlBody = {
							query:
								`mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON) {
									create_item (board_id: $boardId, group_id: $groupId, item_name: $itemName, column_values: $columnValues) {
										id
									}
								}`,
							variables: {
								boardId,
								groupId,
								itemName,
							},
						};

						if (additionalFields.columnValues) {
							try {
								JSON.parse(additionalFields.columnValues as string);
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									"Custom Values must be a valid JSON",
									{
										itemIndex: i,
									},
								);
							}
							body.variables.columnValues = JSON.stringify(
								JSON.parse(additionalFields.columnValues as string),
							);
						}

						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.create_item;
					}
					if (operation === "delete") {
						const itemId = this.getNodeParameter("itemId", i);

						const body: IGraphqlBody = {
							query: `mutation ($itemId: ID!) {
									delete_item (item_id: $itemId) {
										id
									}
								}`,
							variables: {
								itemId,
							},
						};
						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.delete_item;
					}
					if (operation === "get") {
						const itemIds = (this.getNodeParameter("itemId", i) as string)
							.split(",");

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
							variables: {
								itemId: itemIds,
							},
						};
						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.items;
					}
					if (operation === "getAll") {
						const boardId = this.getNodeParameter("boardId", i);
						const groupId = this.getNodeParameter("groupId", i) as string;
						const returnAll = this.getNodeParameter("returnAll", i);

						const fieldsToReturn = `
						{
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
						`;

						const body = {
							query: `query ($boardId: [ID!], $groupId: [String], $limit: Int) {
								boards(ids: $boardId) {
									groups(ids: $groupId) {
										id
										items_page(limit: $limit) {
											cursor
											items ${fieldsToReturn}
										}
									}
								}
							}`,
							variables: {
								boardId,
								groupId,
								limit: 100,
							},
						};

						if (returnAll) {
							responseData = await mondayProApiPaginatedRequest.call(
								this,
								"data.boards[0].groups[0].items_page",
								fieldsToReturn,
								body as IDataObject,
							);
						} else {
							body.variables.limit = this.getNodeParameter("limit", i);
							responseData = await mondayProApiRequest.call(this, body);
							responseData =
								responseData.data.boards[0].groups[0].items_page.items;
						}
					}
					if (operation === "getByColumnValue") {
						const boardId = this.getNodeParameter("boardId", i);
						const columnId = this.getNodeParameter("columnId", i) as string;
						const columnValue = this.getNodeParameter(
							"columnValue",
							i,
						) as string;
						const returnAll = this.getNodeParameter("returnAll", i);

						const fieldsToReturn = `{
							id
							name
							created_at
							state
							board {
								id
							}
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
						}`;
						const body = {
							query:
								`query ($boardId: ID!, $columnId: String!, $columnValue: String!, $limit: Int) {
								items_page_by_column_values(
									limit: $limit
									board_id: $boardId
									columns: [{column_id: $columnId, column_values: [$columnValue]}]
								) {
									cursor
									items ${fieldsToReturn}
								}
							}`,
							variables: {
								boardId,
								columnId,
								columnValue,
								limit: 100,
							},
						};

						if (returnAll) {
							responseData = await mondayProApiPaginatedRequest.call(
								this,
								"data.items_page_by_column_values",
								fieldsToReturn,
								body as IDataObject,
							);
						} else {
							body.variables.limit = this.getNodeParameter("limit", i);
							responseData = await mondayProApiRequest.call(this, body);
							responseData =
								responseData.data.items_page_by_column_values.items;
						}
					}
					if (operation === "move") {
						const groupId = this.getNodeParameter("groupId", i) as string;
						const itemId = this.getNodeParameter("itemId", i);

						const body: IGraphqlBody = {
							query: `mutation ($groupId: String!, $itemId: ID!) {
									move_item_to_group (group_id: $groupId, item_id: $itemId) {
										id
									}
								}`,
							variables: {
								groupId,
								itemId,
							},
						};

						responseData = await mondayProApiRequest.call(this, body);
						responseData = responseData.data.move_item_to_group;
					}
				}
				if (resource === "boardSubitem") {
					if (operation === "create") {
						const parentItemId = this.getNodeParameter("itemId", i);
						const subitemName = this.getNodeParameter("name", i) as string;
						const additionalFields = this.getNodeParameter(
							"additionalFields",
							i,
							{},
						) as IDataObject;

						const body: IGraphqlBody = {
							query: `mutation (
								$parentItemId: ID!,
								$subitemName: String!,
								$columnValues: JSON
							) {
								create_subitem(
									parent_item_id: $parentItemId,
									item_name: $subitemName,
									column_values: $columnValues
								) {
									id
									name
									board {
										id
									}
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
							variables: {
								parentItemId,
								subitemName,
							},
						};

						if (additionalFields.columnValues) {
							try {
								JSON.parse(additionalFields.columnValues as string);
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									"Column values must be valid JSON",
									{ itemIndex: i },
								);
							}

							body.variables.columnValues = JSON.stringify(
								JSON.parse(additionalFields.columnValues as string),
							);
						}

						const response = await mondayProApiRequest.call(this, body);
						responseData = response.data.create_subitem;
					}
				}
				if (resource === "boardWebhook") {
					if (operation === "create") {
						const boardId = this.getNodeParameter("boardId", i);
						const url = this.getNodeParameter("url", i) as string;
						const event = this.getNodeParameter("event", i) as string;
						const additionalFields = this.getNodeParameter(
							"additionalFields",
							i,
							{},
						) as IDataObject;

						const body: IGraphqlBody = {
							query: `mutation (
								$boardId: ID!,
								$url: String!,
								$event: WebhookEventType!,
								$config: JSON
							) {
								create_webhook(
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
							variables: {
								boardId,
								url,
								event,
							},
						};

						if (additionalFields.config) {
							try {
								JSON.parse(additionalFields.config as string);
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									"Config must be valid JSON",
									{ itemIndex: i },
								);
							}

							body.variables.config = JSON.stringify(
								JSON.parse(additionalFields.config as string),
							);
						}

						const response = await mondayProApiRequest.call(this, body);
						responseData = response.data.create_webhook;
					}

					if (operation === "delete") {
						const webhookId = this.getNodeParameter("webhookId", i) as string;

						const body: IGraphqlBody = {
							query: `mutation ($webhookId: ID!) {
								delete_webhook (id: $webhookId) {
									id
								}
							}`,
							variables: {
								webhookId,
							},
						};

						const response = await mondayProApiRequest.call(this, body);
						responseData = response.data.delete_webhook;
					}

					if (operation === "getAll") {
						const boardId = this.getNodeParameter("boardId", i);
						const returnAll = this.getNodeParameter("returnAll", i) as boolean;

						const body: IGraphqlBody = {
							query: `query ($boardId: ID!) {
								webhooks(board_id: $boardId, app_webhooks_only: false) {
									id
									event
									board_id
									config
								}
							}`,
							variables: {
								boardId,
							},
						};

						const response = await mondayProApiRequest.call(this, body);
						let webhooks = (response.data.webhooks ?? []) as IDataObject[];

						if (!returnAll) {
							const limit = this.getNodeParameter("limit", i) as number;
							webhooks = webhooks.slice(0, limit);
						}

						responseData = webhooks;
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
