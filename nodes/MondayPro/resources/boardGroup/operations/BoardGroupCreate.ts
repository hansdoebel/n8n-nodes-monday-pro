import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const boardGroupCreate: INodeProperties[] = [
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
				operation: ["create"],
			},
		},
		description:
			'Choose from the list, or specify an ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: "Name",
		name: "name",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["boardGroup"],
				operation: ["create"],
			},
		},
		description: "The name of the new group",
	},
];

export async function boardGroupCreateExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = this.getNodeParameter("boardId", i);
	const name = this.getNodeParameter("name", i) as string;

	const body: IGraphqlBody = {
		query: `mutation ($boardId: ID!, $groupName: String!) {
			create_group (board_id: $boardId, group_name: $groupName) {
				id
			}
		}`,
		variables: { boardId, groupName: name },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.create_group;
}
