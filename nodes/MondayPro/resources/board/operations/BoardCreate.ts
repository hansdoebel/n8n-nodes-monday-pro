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
		name: "kind",
		type: "options",
		default: "private",
		required: true,
		description: "The board's kind (public / private / share)",
		displayOptions: { show: { resource: ["board"], operation: ["create"] } },
		options: [
			{ name: "Share", value: "share" },
			{ name: "Public", value: "public" },
			{ name: "Private", value: "private" },
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
				displayName: "Template ID",
				name: "templateId",
				type: "number",
				typeOptions: { minValue: 0 },
				default: 0,
				description: "Optional board template ID",
			},
			{
				displayName: "Board Kind",
				name: "boardKind",
				type: "options",
				default: "private",
				description: "The type of board to create",
				options: [
					{ name: "Private", value: "private" },
					{ name: "Public", value: "public" },
					{ name: "Share", value: "share" },
				],
			},
			{
				displayName: "Board Owner IDs",
				name: "boardOwnerIds",
				type: "string",
				description:
					"A list of IDs of users who will be board owners (comma-separated)",
				default: "",
			},
			{
				displayName: "Board Owner Team IDs",
				name: "boardOwnerTeamIds",
				type: "string",
				description:
					"A list of IDs of teams that will be board owners (comma-separated)",
				default: "",
			},
			{
				displayName: "Board Subscriber IDs",
				name: "boardSubscriberIds",
				type: "string",
				description:
					"A list of IDs of users who will subscribe to the board (comma-separated)",
				default: "",
			},
			{
				displayName: "Board Subscriber Team IDs",
				name: "boardSubscriberTeamIds",
				type: "string",
				description:
					"A list of IDs of teams that will subscribe to the board (comma-separated)",
				default: "",
			},
			{
				displayName: "Description",
				name: "description",
				type: "string",
				description: "The new board's description",
				default: "",
			},
			{
				displayName: "Empty Board",
				name: "empty",
				type: "boolean",
				description: "Creates an empty board without any default items",
				default: false,
			},
			{
				displayName: "Folder ID",
				name: "folderId",
				type: "number",
				description: "The board's folder ID",
				default: 0,
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
						displayName: "Singular",
						name: "singular",
						type: "string",
						default: "",
						description: "Singular form of the item nickname",
					},
					{
						displayName: "Preset Type",
						name: "presetType",
						type: "string",
						default: "",
						description: "Preset type for the item nickname",
					},
				],
				displayOptions: {
					show: {
						resource: ["board"],
						operation: ["create"],
					},
				},
			},
			{
				displayName: "Workspace ID",
				name: "workspaceId",
				type: "number",
				description: "The board's workspace ID",
				default: 0,
			},
		],
	},
];

export async function boardCreateExecute(this: IExecuteFunctions, i: number) {
	const name = this.getNodeParameter("name", i) as string;
	const kind = this.getNodeParameter("kind", i) as string;
	const additionalFields = this.getNodeParameter("additionalFields", i, {}) as {
		templateId?: number;
		boardKind?: "private" | "public" | "share";
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
	const body: IGraphqlBody = {
		query: `mutation ($name: String!, $kind: BoardKind!, $templateId: ID) {
				create_board (board_name: $name, board_kind: $kind, template_id: $templateId) {
					id
				}
			}`,
		variables: {
			name,
			kind,
			...(additionalFields.templateId &&
				{ templateId: additionalFields.templateId }),
			...(additionalFields.boardKind &&
				{ boardKind: additionalFields.boardKind }),
			...(additionalFields.boardOwnerIds &&
				{
					boardOwnerIds: additionalFields.boardOwnerIds.split(",").map((id) =>
						id.trim()
					),
				}),
			...(additionalFields.boardOwnerTeamIds &&
				{
					boardOwnerTeamIds: additionalFields.boardOwnerTeamIds.split(",").map(
						(id) => id.trim(),
					),
				}),
			...(additionalFields.boardSubscriberIds &&
				{
					boardSubscriberIds: additionalFields.boardSubscriberIds.split(",")
						.map((id) => id.trim()),
				}),
			...(additionalFields.boardSubscriberTeamIds &&
				{
					boardSubscriberTeamIds: additionalFields.boardSubscriberTeamIds.split(
						",",
					).map((id) => id.trim()),
				}),
			...(additionalFields.description &&
				{ description: additionalFields.description }),
			...(additionalFields.empty !== undefined &&
				{ empty: additionalFields.empty }),
			...(additionalFields.folderId && { folderId: additionalFields.folderId }),
			...(additionalFields.itemNickname && {
				itemNickname: {
					...(additionalFields.itemNickname.plural &&
						{ plural: additionalFields.itemNickname.plural }),
					...(additionalFields.itemNickname.singular &&
						{ singular: additionalFields.itemNickname.singular }),
					...(additionalFields.itemNickname.presetType &&
						{ preset_type: additionalFields.itemNickname.presetType }),
				},
			}),
			...(additionalFields.workspaceId &&
				{ workspaceId: additionalFields.workspaceId }),
		},
	};
	const response = await mondayProApiRequest.call(this, body);
	return response.data.create_board;
}
