import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const boardColumnGetAll: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsMethod: "getBoards",
		},
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["boardColumn"],
				operation: ["getAll"],
			},
		},
	},
];

export async function boardColumnGetAllExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = this.getNodeParameter("boardId", i);
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
