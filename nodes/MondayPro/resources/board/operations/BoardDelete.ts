import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../GenericFunctions";

export const boardDelete: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		typeOptions: { loadOptionsMethod: "getBoards" },
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["board"], operation: ["delete"] },
		},
		description:
			'Board unique identifier. Choose from the list or specify by ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export async function boardDeleteExecute(this: IExecuteFunctions, i: number) {
	const boardId = this.getNodeParameter("boardId", i);
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
