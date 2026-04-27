import type {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	extractResourceLocatorValue,
	folderResourceLocator,
	workspaceResourceLocator,
} from "../../../utils/resourceLocator";

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
			workspaceResourceLocator({
				displayName: "Workspace",
				name: "workspaceId",
				description: "The board's destination workspace",
			}),
			folderResourceLocator({
				displayName: "Folder",
				name: "folderId",
				description: "The board's destination folder",
			}),
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
				displayName: "Owner Names or IDs",
				name: "boardOwnerIds",
				type: "multiOptions",
				typeOptions: { loadOptionsMethod: "getUsers" },
				default: [],
				description:
					'Users who will be board owners. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: "Owner Team Names or IDs",
				name: "boardOwnerTeamIds",
				type: "multiOptions",
				typeOptions: { loadOptionsMethod: "getTeams" },
				default: [],
				description:
					'Teams that will be board owners. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: "Subscriber Names or IDs",
				name: "boardSubscriberIds",
				type: "multiOptions",
				typeOptions: { loadOptionsMethod: "getUsers" },
				default: [],
				description:
					'Users who will subscribe to the board. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: "Subscriber Team Names or IDs",
				name: "boardSubscriberTeamIds",
				type: "multiOptions",
				typeOptions: { loadOptionsMethod: "getTeams" },
				default: [],
				description:
					'Teams that will subscribe to the board. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: "Template ID",
				name: "templateId",
				type: "number",
				typeOptions: { minValue: 0 },
				default: 0,
				description: "Optional board template ID",
			},
		],
	},
];

export async function boardCreateExecute(this: IExecuteFunctions, i: number) {
	const name = this.getNodeParameter("name", i) as string;
	const boardKind = this.getNodeParameter("boardKind", i) as string;

	const additionalFields = this.getNodeParameter("additionalFields", i, {}) as {
		templateId?: number;
		boardOwnerIds?: string[];
		boardOwnerTeamIds?: string[];
		boardSubscriberIds?: string[];
		boardSubscriberTeamIds?: string[];
		description?: string;
		empty?: boolean;
		folderId?: unknown;
		itemNickname?: {
			plural?: string;
			singular?: string;
			presetType?: string;
		};
		workspaceId?: unknown;
	};

	const variables: IDataObject = { name, boardKind };
	const queryParams: string[] = [
		"$name: String!",
		"$boardKind: BoardKind!",
	];

	const mutationArgs: string[] = [
		"board_name: $name",
		"board_kind: $boardKind",
	];

	if (additionalFields.boardOwnerIds && additionalFields.boardOwnerIds.length) {
		variables.boardOwnerIds = additionalFields.boardOwnerIds;
		queryParams.push("$boardOwnerIds: [ID!]");
		mutationArgs.push("board_owner_ids: $boardOwnerIds");
	}

	if (
		additionalFields.boardOwnerTeamIds &&
		additionalFields.boardOwnerTeamIds.length
	) {
		variables.boardOwnerTeamIds = additionalFields.boardOwnerTeamIds;
		queryParams.push("$boardOwnerTeamIds: [ID!]");
		mutationArgs.push("board_owner_team_ids: $boardOwnerTeamIds");
	}

	if (
		additionalFields.boardSubscriberIds &&
		additionalFields.boardSubscriberIds.length
	) {
		variables.boardSubscriberIds = additionalFields.boardSubscriberIds;
		queryParams.push("$boardSubscriberIds: [ID!]");
		mutationArgs.push("board_subscriber_ids: $boardSubscriberIds");
	}

	if (
		additionalFields.boardSubscriberTeamIds &&
		additionalFields.boardSubscriberTeamIds.length
	) {
		variables.boardSubscriberTeamIds = additionalFields.boardSubscriberTeamIds;
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

	const folderId = extractResourceLocatorValue(additionalFields.folderId);
	if (folderId) {
		variables.folderId = folderId;
		queryParams.push("$folderId: ID");
		mutationArgs.push("folder_id: $folderId");
	}

	if (
		additionalFields.itemNickname &&
		Object.keys(additionalFields.itemNickname).length > 0
	) {
		const itemNickname: IDataObject = {};
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

	const workspaceId = extractResourceLocatorValue(additionalFields.workspaceId);
	if (workspaceId) {
		variables.workspaceId = workspaceId;
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
			.map((err: { message: string }) => err.message)
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
