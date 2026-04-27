import type { ILoadOptionsFunctions, INodePropertyOptions } from "n8n-workflow";

import type { IGraphqlBody } from "../types";
import { GRAPHQL_QUERY_NAMES, NODE_PARAMETER_NAMES } from "../types";

import {
	mondayProApiRequest,
	mondayProApiRequestAllItems,
} from "./GenericFunctions";

export async function getBoards(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];
	const body: IGraphqlBody = {
		query: `query ($page: Int, $limit: Int) {
			${GRAPHQL_QUERY_NAMES.BOARDS} (page: $page, limit: $limit){
				id
				description
				name
			}
		}`,
		variables: { page: 1 },
	};
	const boards = await mondayProApiRequestAllItems.call(
		this,
		"data.boards",
		body,
	);
	if (!boards) return [];
	for (const board of boards) {
		returnData.push({
			name: board.name,
			value: board.id,
			description: board.description,
		});
	}
	return returnData;
}

export async function getColumns(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];
	const boardId = this.getCurrentNodeParameter(
		NODE_PARAMETER_NAMES.BOARD_ID,
	) as string;

	const body: IGraphqlBody = {
		query: `query ($boardId: [ID!]) {
			${GRAPHQL_QUERY_NAMES.BOARDS} (ids: $boardId){
				columns {
					id
					title
					type
				}
			}
		}`,
		variables: { boardId },
	};
	const { data } = await mondayProApiRequest.call(this, body);
	if (!data) return returnData;

	for (const column of data.boards[0].columns) {
		returnData.push({
			name: column.title,
			value: column.id,
		});
	}
	return returnData;
}

export async function getGroups(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];
	const boardId = this.getCurrentNodeParameter(
		NODE_PARAMETER_NAMES.BOARD_ID,
	) as string;
	const body: IGraphqlBody = {
		query: `query ($boardId: ID!) {
			${GRAPHQL_QUERY_NAMES.BOARDS} (ids: [$boardId]) {
				groups {
					id
					title
				}
			}
		}`,
		variables: { boardId },
	};
	const { data } = await mondayProApiRequest.call(this, body);
	if (!data) return [];
	for (const group of data.boards[0].groups) {
		returnData.push({
			name: group.title,
			value: group.id,
		});
	}
	return returnData;
}

export async function getUsers(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const body: IGraphqlBody = {
		query: `query ($page: Int, $limit: Int) {
			${GRAPHQL_QUERY_NAMES.USERS} (page: $page, limit: $limit) {
				id
				name
				email
			}
		}`,
		variables: { page: 1 },
	};
	const users = await mondayProApiRequestAllItems.call(this, "data.users", body);
	if (!users) return [];
	return users.map((user: { id: string; name: string; email?: string }) => ({
		name: user.email ? `${user.name} (${user.email})` : user.name,
		value: String(user.id),
	}));
}

export async function getTeams(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const body: IGraphqlBody = {
		query: `query {
			${GRAPHQL_QUERY_NAMES.TEAMS} {
				id
				name
			}
		}`,
		variables: {},
	};
	const { data } = await mondayProApiRequest.call(this, body);
	if (!data?.teams) return [];
	return (data.teams as Array<{ id: string; name: string }>).map((team) => ({
		name: team.name,
		value: String(team.id),
	}));
}
