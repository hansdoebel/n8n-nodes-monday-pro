import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "@types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const boardGroupDelete: INodeProperties[] = [
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
				operation: ["delete"],
			},
		},
		description:
			'Choose from the list, or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: "Group Name or ID",
		name: "groupId",
		type: "options",
		typeOptions: {
			loadOptionsMethod: "getGroups",
			loadOptionsDependsOn: ["boardId"],
		},
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["boardGroup"],
				operation: ["delete"],
			},
		},
		description:
			'Choose from the list, or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export async function boardGroupDeleteExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = this.getNodeParameter("boardId", i);
	const groupId = this.getNodeParameter("groupId", i) as string;

	const body: IGraphqlBody = {
		query: `mutation ($boardId: ID!, $groupId: String!) {
			delete_group (board_id: $boardId, group_id: $groupId) {
				id
			}
		}`,
		variables: { boardId, groupId },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.delete_group;
}
