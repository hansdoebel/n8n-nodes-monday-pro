import type { INodeProperties } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import type { IGraphqlBody } from "@types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const setBoardPermission: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		typeOptions: { loadOptionsMethod: "getBoards" },
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["board"], operation: ["setPermission"] },
		},
		description:
			'Board unique identifier. Choose from the list or specify by ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: "Basic Role Name",
		name: "basicRoleName",
		type: "options",
		required: true,
		default: "viewer",
		displayOptions: {
			show: { resource: ["board"], operation: ["setPermission"] },
		},
		description: "The role's name",
		options: [
			{ name: "Contributor (Can Edit Content)", value: "contributor" },
			{ name: "Editor (Can Edit Content and Structure)", value: "editor" },
			{ name: "Viewer (Read-Only)", value: "viewer" },
		],
	},
];

export async function boardSetPermissionExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = this.getNodeParameter("boardId", i);
	const basicRoleName = this.getNodeParameter("basicRoleName", i) as string;

	const query = `mutation ($boardId: ID!, $basicRoleName: BoardBasicRoleName!) {
		set_board_permission(board_id: $boardId, basic_role_name: $basicRoleName) {
			edit_permissions
			failed_actions
		}
	}`;

	const body: IGraphqlBody = {
		query,
		variables: {
			boardId,
			basicRoleName,
		},
	};

	const response = await mondayProApiRequest.call(this, body);

	if (!response) {
		throw new Error("No response from API");
	}

	if (response.errors) {
		const errorMessage = response.errors
			.map((err: any) => err.message)
			.join(", ");
		throw new Error(`GraphQL Error: ${errorMessage}`);
	}

	if (!response.data) {
		throw new Error(
			`Invalid API response structure: ${JSON.stringify(response)}`,
		);
	}

	if (!response.data.set_board_permission) {
		throw new Error(
			`Set board permission failed: ${JSON.stringify(response.data)}`,
		);
	}

	let parsedResponse = response.data.set_board_permission;

	if (typeof parsedResponse === "string") {
		try {
			parsedResponse = JSON.parse(parsedResponse);
		} catch (e) {
			throw new Error(
				`Failed to parse set_board_permission response: ${parsedResponse}. Error: ${
					(e as Error).message
				}`,
			);
		}
	}

	return {
		success: true,
		boardId,
		basicRoleName,
		editPermissions: parsedResponse.edit_permissions,
		failedActions: parsedResponse.failed_actions,
	};
}
