import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	boardResourceLocator,
	extractResourceLocatorValue,
} from "../../../utils/resourceLocator";

export const boardDelete: INodeProperties[] = [
	boardResourceLocator({
		displayName: "Board",
		name: "boardId",
		required: true,
		description: "The board to delete",
		displayOptions: {
			show: { resource: ["board"], operation: ["delete"] },
		},
	}),
];

export async function boardDeleteExecute(this: IExecuteFunctions, i: number) {
	const boardId = extractResourceLocatorValue(
		this.getNodeParameter("boardId", i),
	);
	const body: IGraphqlBody = {
		query: `mutation ($id: ID!) {
			delete_board (board_id: $id) {
				id
			}
		}`,
		variables: { id: boardId },
	};
	const response = await mondayProApiRequest.call(this, body);
	return response.data.delete_board;
}
