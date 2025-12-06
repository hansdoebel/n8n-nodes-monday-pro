import type { ILoadOptionsFunctions, INodePropertyOptions } from "n8n-workflow";

import type { IGraphqlBody } from "./types";

import {
	mondayProApiRequest,
	mondayProApiRequestAllItems,
} from "./GenericFunctions.js";

/**
 * Fetches all boards in the account.
 */
export async function getBoards(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];
	const body: IGraphqlBody = {
		query: `query ($page: Int, $limit: Int) {
			boards (page: $page, limit: $limit){
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

/**
 * Fetches columns for a given board (id + title only, simple list)
 */
export async function getColumns(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];
	const boardId = this.getCurrentNodeParameter("boardId") as string;

	const body: IGraphqlBody = {
		query: `query ($boardId: [ID!]) {
			boards (ids: $boardId){
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

/**
 * Fetches all groups for a given board.
 */
export async function getGroups(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const returnData: INodePropertyOptions[] = [];
	const boardId = this.getCurrentNodeParameter("boardId") as string;
	const body: IGraphqlBody = {
		query: `query ($boardId: ID!) {
			boards (ids: [$boardId]) {
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
