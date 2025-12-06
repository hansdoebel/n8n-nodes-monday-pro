import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../GenericFunctions";

export const boardGroupGetAll: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getBoards",
		},
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["boardGroup"],
				operation: ["getAll"],
			},
		},
		description:
			'Choose from the list, or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export async function boardGroupGetAllExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = this.getNodeParameter("boardId", i);

	const body: IGraphqlBody = {
		query: `query ($boardId: [ID!]) {
			boards (ids: $boardId) {
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
		variables: { boardId },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.boards[0].groups;
}
