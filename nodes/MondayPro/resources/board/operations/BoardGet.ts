import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	boardResourceLocator,
	extractResourceLocatorValue,
} from "../../../utils/resourceLocator";

export const boardGet: INodeProperties[] = [
	boardResourceLocator({
		displayName: "Board",
		name: "boardId",
		required: true,
		description: "The board to fetch",
		displayOptions: {
			show: { resource: ["board"], operation: ["get"] },
		},
	}),
];

export async function boardGetExecute(this: IExecuteFunctions, i: number) {
	const boardId = extractResourceLocatorValue(
		this.getNodeParameter("boardId", i),
	);
	const body: IGraphqlBody = {
		query: `query ($id: [ID!]) {
				boards (ids: $id) {
					id
					name
					description
					state
					board_folder_id
					board_kind
					owners { id }
				}
			}`,
		variables: { id: boardId },
	};
	const response = await mondayProApiRequest.call(this, body);
	return response.data.boards;
}
