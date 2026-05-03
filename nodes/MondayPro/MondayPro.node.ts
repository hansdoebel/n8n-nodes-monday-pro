import { NodeOperationError } from "n8n-workflow";
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from "n8n-workflow";

import { boardDescription } from "./resources/board";
import { boardColumnDescription } from "./resources/boardColumn";
import { boardGroupDescription } from "./resources/boardGroup";
import { boardItemDescription } from "./resources/boardItem";
import { boardSubitemDescription } from "./resources/boardSubitem";
import { boardWebhookDescription } from "./resources/boardWebhook";
import { docsDescription } from "./resources/docs";
import { folderDescription } from "./resources/folder";

import * as LoadOptions from "./utils/LoadOptions";
import * as ListSearch from "./utils/ListSearch";

import * as Ops from "./resources";

type PerItemExecuteFn = (
	this: IExecuteFunctions,
	i: number,
) => Promise<unknown>;

type BatchedExecuteFn = ((
	this: IExecuteFunctions,
	items: INodeExecutionData[],
) => Promise<INodeExecutionData[]>) & { batch: true };

type OperationExecuteFn = PerItemExecuteFn | BatchedExecuteFn;

function isBatchedExecuteFn(fn: unknown): fn is BatchedExecuteFn {
	return typeof fn === "function" && (fn as { batch?: boolean }).batch === true;
}

const routers: Record<string, Record<string, OperationExecuteFn>> = {
	board: Ops.BoardOps as unknown as Record<string, OperationExecuteFn>,
	boardColumn: Ops.BoardColumnOps as unknown as Record<string, OperationExecuteFn>,
	boardGroup: Ops.BoardGroupOps as unknown as Record<string, OperationExecuteFn>,
	boardItem: Ops.BoardItemOps as unknown as Record<string, OperationExecuteFn>,
	boardSubitem: Ops.BoardSubitemOps as unknown as Record<string, OperationExecuteFn>,
	boardWebhook: Ops.BoardWebhookOps as unknown as Record<string, OperationExecuteFn>,
	docs: Ops.DocsOps as unknown as Record<string, OperationExecuteFn>,
	folder: Ops.FolderOps as unknown as Record<string, OperationExecuteFn>,
};

export class MondayPro implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Monday.com (Pro)",
		name: "mondayPro",
		icon: "file:../../icons/mondayPro.svg",
		group: ["output"],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: "Consume Monday.com API",
		defaults: {
			name: "Monday.com (Pro)",
		},
		usableAsTool: true,
		inputs: ["main"],
		outputs: ["main"],
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
					{
						name: "Doc",
						value: "docs",
					},
					{
						name: "Folder",
						value: "folder",
					},
				],
				default: "board",
			},
			...boardDescription,
			...boardColumnDescription,
			...boardGroupDescription,
			...boardItemDescription,
			...boardSubitemDescription,
			...boardWebhookDescription,
			...docsDescription,
			...folderDescription,
		],
	};

	methods = {
		loadOptions: {
			...LoadOptions,
		},
		listSearch: {
			...ListSearch,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const results: INodeExecutionData[] = [];

		const resource = this.getNodeParameter(
			"resource",
			0,
		) as keyof typeof routers;
		const operation = this.getNodeParameter("operation", 0) as string;

		const resourceRouter = routers[resource];
		const execFn = resourceRouter
			?.[
				`${resource}${operation[0].toUpperCase()}${
					operation.slice(1)
				}Execute`
			];

		if (typeof execFn !== "function") {
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported operation: ${resource}.${operation}`,
			);
		}

		if (isBatchedExecuteFn(execFn)) {
			const batchedResults = await execFn.call(this, items);
			return [batchedResults];
		}

		for (let i = 0; i < items.length; i++) {
			try {
				const response = await execFn.call(this, i);

				results.push(
					...this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(
							response as Parameters<
								typeof this.helpers.returnJsonArray
							>[0],
						),
						{ itemData: { item: i } },
					),
				);
			} catch (error) {
				if (this.continueOnFail()) {
					results.push(
						...this.helpers.constructExecutionMetaData(
							this.helpers.returnJsonArray({ error: (error as Error).message }),
							{ itemData: { item: i } },
						),
					);
					continue;
				}
				throw error;
			}
		}

		return [results];
	}
}
