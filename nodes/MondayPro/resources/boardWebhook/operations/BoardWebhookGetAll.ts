import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	boardResourceLocator,
	extractResourceLocatorValue,
} from "../../../utils/resourceLocator";

export const boardWebhookGetAll: INodeProperties[] = [
	boardResourceLocator({
		displayName: "Board",
		name: "boardId",
		required: true,
		description: "The board to list webhooks for",
		displayOptions: {
			show: { resource: ["boardWebhook"], operation: ["getAll"] },
		},
	}),
	{
		displayName: "Return All",
		name: "returnAll",
		type: "boolean",
		default: true,
		displayOptions: {
			show: { resource: ["boardWebhook"], operation: ["getAll"] },
		},
		description: "Whether to return all results or only up to a given limit",
	},
	{
		displayName: "Limit",
		name: "limit",
		type: "number",
		default: 50,
		typeOptions: { minValue: 1 },
		displayOptions: {
			show: {
				resource: ["boardWebhook"],
				operation: ["getAll"],
				returnAll: [false],
			},
		},
		description: "Max number of results to return",
	},
];

export async function boardWebhookGetAllExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = extractResourceLocatorValue(
		this.getNodeParameter("boardId", i),
	);
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
		variables: { boardId },
	};

	const response = await mondayProApiRequest.call(this, body);
	let webhooks = response.data.webhooks ?? [];

	if (!returnAll) {
		const limit = this.getNodeParameter("limit", i) as number;
		webhooks = webhooks.slice(0, limit);
	}
	return webhooks;
}
