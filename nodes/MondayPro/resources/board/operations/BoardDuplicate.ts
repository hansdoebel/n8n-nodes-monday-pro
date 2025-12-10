import type { INodeProperties } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const boardDuplicate: INodeProperties[] = [
	{
		displayName: "Board ID",
		name: "boardId",
		type: "string",
		required: true,
		default: "",
		displayOptions: { show: { resource: ["board"], operation: ["duplicate"] } },
		description: "The board's unique identifier",
	},
	{
		displayName: "Duplicate Type",
		name: "duplicateType",
		type: "options",
		required: true,
		default: "duplicate_board_with_structure",
		displayOptions: { show: { resource: ["board"], operation: ["duplicate"] } },
		description: "The duplication type",
		options: [
			{
				name: "Structure Only",
				value: "duplicate_board_with_structure",
				description: "Duplicate structure only",
			},
			{
				name: "Structure and Items",
				value: "duplicate_board_with_pulses",
				description: "Duplicate structure and items",
			},
			{
				name: "Structure, Items, and Updates",
				value: "duplicate_board_with_pulses_and_updates",
				description: "Duplicate structure, items, and updates",
			},
		],
	},
	{
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: { show: { resource: ["board"], operation: ["duplicate"] } },
		options: [
			{
				displayName: "Board Name",
				name: "boardName",
				type: "string",
				default: "",
				description:
					"The board's name. If omitted, it will be automatically generated.",
			},
			{
				displayName: "Folder ID",
				name: "folderId",
				type: "string",
				default: "",
				description:
					"The destination folder within the destination workspace. Required if duplicating to another workspace.",
			},
			{
				displayName: "Keep Subscribers",
				name: "keepSubscribers",
				type: "boolean",
				default: false,
				description: "Whether to duplicate the subscribers to the new board",
			},
			{
				displayName: "Workspace ID",
				name: "workspaceId",
				type: "string",
				default: "",
				description:
					"The destination workspace. If omitted, it will default to the original board's workspace.",
			},
		],
	},
];

export async function boardDuplicateExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = this.getNodeParameter("boardId", i) as string;
	const duplicateType = this.getNodeParameter("duplicateType", i) as string;
	const additionalFields = this.getNodeParameter("additionalFields", i, {}) as {
		boardName?: string;
		folderId?: string;
		keepSubscribers?: boolean;
		workspaceId?: string;
	};

	const variables: Record<string, any> = {
		boardId,
		duplicateType,
	};
	const queryParams: string[] = [
		"$boardId: ID!",
		"$duplicateType: DuplicateBoardType!",
	];
	const mutationArgs: string[] = [
		"board_id: $boardId",
		"duplicate_type: $duplicateType",
	];

	if (additionalFields.boardName) {
		variables.boardName = additionalFields.boardName;
		queryParams.push("$boardName: String");
		mutationArgs.push("board_name: $boardName");
	}

	if (additionalFields.folderId) {
		variables.folderId = additionalFields.folderId;
		queryParams.push("$folderId: ID");
		mutationArgs.push("folder_id: $folderId");
	}

	if (additionalFields.keepSubscribers !== undefined) {
		variables.keepSubscribers = additionalFields.keepSubscribers;
		queryParams.push("$keepSubscribers: Boolean");
		mutationArgs.push("keep_subscribers: $keepSubscribers");
	}

	if (additionalFields.workspaceId) {
		variables.workspaceId = additionalFields.workspaceId;
		queryParams.push("$workspaceId: ID");
		mutationArgs.push("workspace_id: $workspaceId");
	}

	const query = `mutation (${queryParams.join(", ")}) {
		duplicate_board(${mutationArgs.join(", ")}) {
			board {
				id
			}
		}
	}`;

	const body: IGraphqlBody = {
		query,
		variables,
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

	if (!response.data.duplicate_board) {
		throw new Error(
			`Board duplication failed: ${JSON.stringify(response.data)}`,
		);
	}

	return response.data.duplicate_board;
}
