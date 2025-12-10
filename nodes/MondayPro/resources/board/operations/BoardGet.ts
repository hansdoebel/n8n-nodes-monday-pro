import type { INodeProperties } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const boardGet: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		typeOptions: { loadOptionsMethod: "getBoards" },
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["board"], operation: ["get"] },
		},
		description:
			'Board unique identifier. Choose from the list or specify by ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export async function boardGetExecute(this: IExecuteFunctions, i: number) {
	const boardId = this.getNodeParameter("boardId", i);
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
