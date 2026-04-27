import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	boardResourceLocator,
	extractResourceLocatorValue,
} from "../../../utils/resourceLocator";

export const boardGroupCreate: INodeProperties[] = [
	boardResourceLocator({
		displayName: "Board",
		name: "boardId",
		required: true,
		description: "The board to create the group in",
		displayOptions: {
			show: { resource: ["boardGroup"], operation: ["create"] },
		},
	}),
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
	const boardId = extractResourceLocatorValue(
		this.getNodeParameter("boardId", i),
	);
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
