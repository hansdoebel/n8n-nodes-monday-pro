import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import {
	mondayProApiRequest,
	mondayProApiRequestAllItems,
} from "@utils/GenericFunctions";

export const boardGetAll: INodeProperties[] = [
	{
		displayName: "Return All",
		name: "returnAll",
		type: "boolean",
		default: false,
		displayOptions: { show: { resource: ["board"], operation: ["getAll"] } },
		description: "Whether to return all results or only up to a given limit",
	},
	{
		displayName: "Limit",
		name: "limit",
		type: "number",
		typeOptions: { minValue: 1 },
		default: 50,
		displayOptions: {
			show: {
				resource: ["board"],
				operation: ["getAll"],
				returnAll: [false],
			},
		},
		description: "Max number of results to return",
	},
];

export async function boardGetAllExecute(this: IExecuteFunctions, i: number) {
	const returnAll = this.getNodeParameter("returnAll", i);
	const body: IGraphqlBody = {
		query: `query ($page: Int, $limit: Int) {
			boards (page: $page, limit: $limit) {
				id
				name
				description
				state
				board_folder_id
				board_kind
				owners { id }
			}
		}`,
		variables: { page: 1 },
	};
	if (returnAll) {
		return await mondayProApiRequestAllItems.call(this, "data.boards", body);
	}
	body.variables.limit = this.getNodeParameter("limit", i);
	const response = await mondayProApiRequest.call(this, body);
	return response.data.boards;
}
