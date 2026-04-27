import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from "n8n-workflow";

import type { IGraphqlBody } from "../types";
import { mondayProApiRequest } from "./GenericFunctions";
import { extractResourceLocatorValue } from "./resourceLocator";

const PAGE_SIZE = 100;

function applyFilter<T extends INodeListSearchItems>(
	items: T[],
	filter?: string,
): T[] {
	if (!filter) return items;
	const needle = filter.toLowerCase();
	return items.filter((i) => i.name.toLowerCase().includes(needle));
}

function readDependentParam(
	this: ILoadOptionsFunctions,
	candidatePaths: string[],
): string {
	for (const path of candidatePaths) {
		try {
			const raw = this.getCurrentNodeParameter(path);
			const value = extractResourceLocatorValue(raw);
			if (value) return value;
		} catch {
			// parameter not found at this path — try the next
		}
	}
	return "";
}

export async function searchBoards(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const results: INodeListSearchItems[] = [];
	let page = 1;

	while (true) {
		const body: IGraphqlBody = {
			query: `query ($page: Int, $limit: Int) {
				boards (page: $page, limit: $limit, state: active) {
					id
					name
				}
			}`,
			variables: { page, limit: PAGE_SIZE },
		};
		const response = await mondayProApiRequest.call(this, body);
		const boards = (response?.data?.boards ?? []) as Array<{
			id: string;
			name: string;
		}>;
		if (boards.length === 0) break;
		for (const board of boards) {
			results.push({ name: board.name, value: String(board.id) });
		}
		if (boards.length < PAGE_SIZE) break;
		page++;
	}

	return { results: applyFilter(results, filter) };
}

export async function searchWorkspaces(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const results: INodeListSearchItems[] = [];
	let page = 1;

	while (true) {
		const body: IGraphqlBody = {
			query: `query ($page: Int, $limit: Int) {
				workspaces (page: $page, limit: $limit, state: active) {
					id
					name
				}
			}`,
			variables: { page, limit: PAGE_SIZE },
		};
		const response = await mondayProApiRequest.call(this, body);
		const workspaces = (response?.data?.workspaces ?? []) as Array<{
			id: string;
			name: string;
		}>;
		if (workspaces.length === 0) break;
		for (const ws of workspaces) {
			results.push({ name: ws.name, value: String(ws.id) });
		}
		if (workspaces.length < PAGE_SIZE) break;
		page++;
	}

	return { results: applyFilter(results, filter) };
}

export async function searchFolders(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const workspaceId = readDependentParam.call(this, [
		"additionalFields.workspaceId",
		"updateFields.workspaceId",
		"workspaceId",
	]);

	const results: INodeListSearchItems[] = [];
	let page = 1;

	while (true) {
		const body: IGraphqlBody = {
			query: workspaceId
				? `query ($page: Int, $limit: Int, $workspaceIds: [ID]) {
					folders (page: $page, limit: $limit, workspace_ids: $workspaceIds) {
						id
						name
						workspace { id name }
					}
				}`
				: `query ($page: Int, $limit: Int) {
					folders (page: $page, limit: $limit) {
						id
						name
						workspace { id name }
					}
				}`,
			variables: workspaceId
				? { page, limit: PAGE_SIZE, workspaceIds: [workspaceId] }
				: { page, limit: PAGE_SIZE },
		};
		const response = await mondayProApiRequest.call(this, body);
		const folders = (response?.data?.folders ?? []) as Array<{
			id: string;
			name: string;
			workspace?: { name?: string } | null;
		}>;
		if (folders.length === 0) break;
		for (const folder of folders) {
			const name = folder.workspace?.name && !workspaceId
				? `${folder.name} (${folder.workspace.name})`
				: folder.name;
			results.push({ name, value: String(folder.id) });
		}
		if (folders.length < PAGE_SIZE) break;
		page++;
	}

	return { results: applyFilter(results, filter) };
}

export async function searchItems(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const boardId = readDependentParam.call(this, [
		"boardId",
		"additionalFields.boardId",
	]);
	if (!boardId) return { results: [] };

	const body: IGraphqlBody = {
		query: `query ($boardId: [ID!]) {
			boards (ids: $boardId) {
				items_page (limit: 100, query_params: { order_by: [{ column_id: "__creation_log__", direction: desc }] }) {
					items { id name }
				}
			}
		}`,
		variables: { boardId },
	};
	const response = await mondayProApiRequest.call(this, body);
	const items = (response?.data?.boards?.[0]?.items_page?.items ?? []) as Array<
		{ id: string; name: string }
	>;

	const results: INodeListSearchItems[] = items.map((item) => ({
		name: item.name,
		value: String(item.id),
	}));

	return { results: applyFilter(results, filter) };
}

export async function searchColumns(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const boardId = readDependentParam.call(this, [
		"boardId",
		"additionalFields.boardId",
	]);
	if (!boardId) return { results: [] };

	const body: IGraphqlBody = {
		query: `query ($boardId: [ID!]) {
			boards (ids: $boardId) {
				columns {
					id
					title
					type
				}
			}
		}`,
		variables: { boardId },
	};
	const response = await mondayProApiRequest.call(this, body);
	const columns = (response?.data?.boards?.[0]?.columns ?? []) as Array<{
		id: string;
		title: string;
		type: string;
	}>;

	const results: INodeListSearchItems[] = columns.map((column) => ({
		name: column.title,
		value: String(column.id),
	}));

	return { results: applyFilter(results, filter) };
}

export async function searchGroups(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const boardId = readDependentParam.call(this, [
		"boardId",
		"additionalFields.boardId",
	]);
	if (!boardId) return { results: [] };

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
	const response = await mondayProApiRequest.call(this, body);
	const groups = (response?.data?.boards?.[0]?.groups ?? []) as Array<{
		id: string;
		title: string;
	}>;

	const results: INodeListSearchItems[] = groups.map((group) => ({
		name: group.title,
		value: String(group.id),
	}));

	return { results: applyFilter(results, filter) };
}

export async function searchDocs(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const results: INodeListSearchItems[] = [];
	let page = 1;

	while (true) {
		const body: IGraphqlBody = {
			query: `query ($page: Int, $limit: Int) {
				docs (page: $page, limit: $limit) {
					id
					name
				}
			}`,
			variables: { page, limit: PAGE_SIZE },
		};
		const response = await mondayProApiRequest.call(this, body);
		const docs = (response?.data?.docs ?? []) as Array<{
			id: string;
			name: string;
		}>;
		if (docs.length === 0) break;
		for (const doc of docs) {
			results.push({ name: doc.name, value: String(doc.id) });
		}
		if (docs.length < PAGE_SIZE) break;
		page++;
	}

	return { results: applyFilter(results, filter) };
}

export async function searchUsers(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const results: INodeListSearchItems[] = [];
	let page = 1;

	while (true) {
		const body: IGraphqlBody = {
			query: `query ($page: Int, $limit: Int) {
				users (page: $page, limit: $limit) {
					id
					name
					email
				}
			}`,
			variables: { page, limit: PAGE_SIZE },
		};
		const response = await mondayProApiRequest.call(this, body);
		const users = (response?.data?.users ?? []) as Array<{
			id: string;
			name: string;
			email?: string;
		}>;
		if (users.length === 0) break;
		for (const user of users) {
			results.push({
				name: user.email ? `${user.name} (${user.email})` : user.name,
				value: String(user.id),
			});
		}
		if (users.length < PAGE_SIZE) break;
		page++;
	}

	return { results: applyFilter(results, filter) };
}

export async function searchTeams(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const body: IGraphqlBody = {
		query: `query {
			teams { id name }
		}`,
		variables: {},
	};
	const response = await mondayProApiRequest.call(this, body);
	const teams = (response?.data?.teams ?? []) as Array<{
		id: string;
		name: string;
	}>;

	const results: INodeListSearchItems[] = teams.map((team) => ({
		name: team.name,
		value: String(team.id),
	}));

	return { results: applyFilter(results, filter) };
}
