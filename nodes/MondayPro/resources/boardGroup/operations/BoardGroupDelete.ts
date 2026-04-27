import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	boardResourceLocator,
	extractResourceLocatorValue,
	groupResourceLocator,
} from "../../../utils/resourceLocator";

export const boardGroupDelete: INodeProperties[] = [
	boardResourceLocator({
		displayName: "Board",
		name: "boardId",
		required: true,
		description: "The board the group belongs to",
		displayOptions: {
			show: { resource: ["boardGroup"], operation: ["delete"] },
		},
	}),
	groupResourceLocator({
		displayName: "Group",
		name: "groupId",
		required: true,
		description: "The group to delete",
		displayOptions: {
			show: { resource: ["boardGroup"], operation: ["delete"] },
		},
	}),
];

export async function boardGroupDeleteExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = extractResourceLocatorValue(
		this.getNodeParameter("boardId", i),
	);
	const groupId = extractResourceLocatorValue(
		this.getNodeParameter("groupId", i),
	);

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
