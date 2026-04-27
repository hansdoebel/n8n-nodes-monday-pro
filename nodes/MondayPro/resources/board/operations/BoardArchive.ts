import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	boardResourceLocator,
	extractResourceLocatorValue,
} from "../../../utils/resourceLocator";

export const boardArchive: INodeProperties[] = [
	boardResourceLocator({
		displayName: "Board",
		name: "boardId",
		required: true,
		description: "The board to archive",
		displayOptions: {
			show: { resource: ["board"], operation: ["archive"] },
		},
	}),
];

export async function boardArchiveExecute(this: IExecuteFunctions, i: number) {
	const boardId = extractResourceLocatorValue(
		this.getNodeParameter("boardId", i),
	);
	const body: IGraphqlBody = {
		query: `mutation ($id: ID!) {
			archive_board (board_id: $id) {
				id
			}
		}`,
		variables: { id: boardId },
	};
	const response = await mondayProApiRequest.call(this, body);
	return response.data.archive_board;
}
