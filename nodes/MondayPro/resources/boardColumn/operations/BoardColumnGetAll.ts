import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	boardResourceLocator,
	extractResourceLocatorValue,
} from "../../../utils/resourceLocator";

export const boardColumnGetAll: INodeProperties[] = [
	boardResourceLocator({
		displayName: "Board",
		name: "boardId",
		required: true,
		description: "The board to list columns from",
		displayOptions: {
			show: { resource: ["boardColumn"], operation: ["getAll"] },
		},
	}),
];

export async function boardColumnGetAllExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = extractResourceLocatorValue(
		this.getNodeParameter("boardId", i),
	);
	const body: IGraphqlBody = {
		query: `query ($boardId: [ID!]) {
			boards (ids: $boardId) {
				columns {
					id
					title
					type
					settings_str
					archived
				}
			}
		}`,
		variables: { boardId },
	};
	const response = await mondayProApiRequest.call(this, body);
	return response.data.boards[0].columns;
}
