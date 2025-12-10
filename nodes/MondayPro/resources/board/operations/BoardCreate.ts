import type { INodeProperties } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../GenericFunctions";

export const boardCreate: INodeProperties[] = [
	{
		displayName: "Name",
		name: "name",
		type: "string",
		required: true,
		default: "",
		displayOptions: { show: { resource: ["board"], operation: ["create"] } },
		description: "The board's name",
	},
	{
		displayName: "Kind",
		name: "boardKind",
		type: "options",
		default: "private",
		required: true,
		displayOptions: { show: { resource: ["board"], operation: ["create"] } },
		description: "The type of board to create",
		options: [
			{ name: "Private", value: "private" },
			{ name: "Public", value: "public" },
			{ name: "Share", value: "share" },
		],
	},
	{
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: { show: { resource: ["board"], operation: ["create"] } },
		options: [
			{
				displayName: "Description",
				name: "description",
				type: "string",
				default: "",
				description: "The new board's description",
			},
			{
				displayName: "Empty Board",
				name: "empty",
				type: "boolean",
				default: false,
				description:
					"Whether to create an empty board without any default items",
			},
			{
				displayName: "Folder ID",
				name: "folderId",
				type: "number",
				default: 0,
				description: "The board's folder ID",
			},
			{
				displayName: "Item Nickname",
				name: "itemNickname",
				type: "collection",
				default: {},
				description: "The nickname configuration for items on the board",
				options: [
					{
						displayName: "Plural",
						name: "plural",
						type: "string",
						default: "",
						description: "Plural form of the item nickname",
					},
					{
						displayName: "Preset Type",
						name: "presetType",
						type: "string",
						default: "",
						description: "Preset type for the item nickname",
					},
					{
						displayName: "Singular",
						name: "singular",
						type: "string",
						default: "",
						description: "Singular form of the item nickname",
					},
				],
			},
			{
				displayName: "Owner IDs",
				name: "boardOwnerIds",
				type: "string",
				default: "",
				description:
					"A list of IDs of users who will be board owners (comma-separated)",
			},
			{
				displayName: "Owner Team IDs",
				name: "boardOwnerTeamIds",
				type: "string",
				default: "",
				description:
					"A list of IDs of teams that will be board owners (comma-separated)",
			},
			{
				displayName: "Subscriber IDs",
				name: "boardSubscriberIds",
				type: "string",
				default: "",
				description:
					"A list of IDs of users who will subscribe to the board (comma-separated)",
			},
			{
				displayName: "Subscriber Team IDs",
				name: "boardSubscriberTeamIds",
				type: "string",
				default: "",
				description:
					"A list of IDs of teams that will subscribe to the board (comma-separated)",
			},
			{
				displayName: "Template ID",
				name: "templateId",
				type: "number",
				typeOptions: { minValue: 0 },
				default: 0,
				description: "Optional board template ID",
			},
			{
				displayName: "Workspace ID",
				name: "workspaceId",
				type: "number",
				default: 0,
				description: "The board's workspace ID",
			},
		],
	},
];

export async function boardCreateExecute(this: IExecuteFunctions, i: number) {
	const name = this.getNodeParameter("name", i) as string;
	const boardKind = this.getNodeParameter("boardKind", i) as string;

	const additionalFields = this.getNodeParameter("additionalFields", i, {}) as {
		templateId?: number;
		boardOwnerIds?: string;
		boardOwnerTeamIds?: string;
		boardSubscriberIds?: string;
		boardSubscriberTeamIds?: string;
		description?: string;
		empty?: boolean;
		folderId?: number;
		itemNickname?: {
			plural?: string;
			singular?: string;
			presetType?: string;
		};
		workspaceId?: number;
	};

	const variables: Record<string, any> = { name, boardKind };
	const queryParams: string[] = [
		"$name: String!",
		"$boardKind: BoardKind!",
	];

	const mutationArgs: string[] = [
		"board_name: $name",
		"board_kind: $boardKind",
	];

	if (additionalFields.boardOwnerIds) {
		variables.boardOwnerIds = additionalFields.boardOwnerIds
			.split(",")
			.map((id) => id.trim());
		queryParams.push("$boardOwnerIds: [ID!]");
		mutationArgs.push("board_owner_ids: $boardOwnerIds");
	}

	if (additionalFields.boardOwnerTeamIds) {
		variables.boardOwnerTeamIds = additionalFields.boardOwnerTeamIds
			.split(",")
			.map((id) => id.trim());
		queryParams.push("$boardOwnerTeamIds: [ID!]");
		mutationArgs.push("board_owner_team_ids: $boardOwnerTeamIds");
	}

	if (additionalFields.boardSubscriberIds) {
		variables.boardSubscriberIds = additionalFields.boardSubscriberIds
			.split(",")
			.map((id) => id.trim());
		queryParams.push("$boardSubscriberIds: [ID!]");
		mutationArgs.push("board_subscriber_ids: $boardSubscriberIds");
	}

	if (additionalFields.boardSubscriberTeamIds) {
		variables.boardSubscriberTeamIds = additionalFields.boardSubscriberTeamIds
			.split(",")
			.map((id) => id.trim());
		queryParams.push("$boardSubscriberTeamIds: [ID!]");
		mutationArgs.push("board_subscriber_teams_ids: $boardSubscriberTeamIds");
	}

	if (additionalFields.description) {
		variables.description = additionalFields.description;
		queryParams.push("$description: String");
		mutationArgs.push("description: $description");
	}

	if (additionalFields.empty !== undefined) {
		variables.empty = additionalFields.empty;
		queryParams.push("$empty: Boolean");
		mutationArgs.push("empty: $empty");
	}

	if (additionalFields.folderId) {
		variables.folderId = String(additionalFields.folderId);
		queryParams.push("$folderId: ID");
		mutationArgs.push("folder_id: $folderId");
	}

	if (
		additionalFields.itemNickname &&
		Object.keys(additionalFields.itemNickname).length > 0
	) {
		const itemNickname: Record<string, any> = {};
		if (additionalFields.itemNickname.plural) {
			itemNickname.plural = additionalFields.itemNickname.plural;
		}
		if (additionalFields.itemNickname.singular) {
			itemNickname.singular = additionalFields.itemNickname.singular;
		}
		if (additionalFields.itemNickname.presetType) {
			itemNickname.preset_type = additionalFields.itemNickname.presetType;
		}
		if (Object.keys(itemNickname).length > 0) {
			variables.itemNickname = itemNickname;
			queryParams.push("$itemNickname: ItemNicknameInput");
			mutationArgs.push("item_nickname: $itemNickname");
		}
	}

	if (additionalFields.templateId) {
		variables.templateId = String(additionalFields.templateId);
		queryParams.push("$templateId: ID");
		mutationArgs.push("template_id: $templateId");
	}

	if (additionalFields.workspaceId) {
		variables.workspaceId = String(additionalFields.workspaceId);
		queryParams.push("$workspaceId: ID");
		mutationArgs.push("workspace_id: $workspaceId");
	}

	const query = `mutation (${queryParams.join(", ")}) {
		create_board(${mutationArgs.join(", ")}) {
			id
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

	if (!response.data.create_board) {
		throw new Error(
			`Board creation failed: ${JSON.stringify(response.data)}`,
		);
	}

	return response.data.create_board;
}
