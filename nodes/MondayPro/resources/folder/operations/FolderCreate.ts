import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../GenericFunctions";

export const folderCreate: INodeProperties[] = [
	{
		displayName: "Folder Name",
		name: "name",
		type: "string",
		required: true,
		default: "",
		displayOptions: {
			show: {
				resource: ["folder"],
				operation: ["create"],
			},
		},
		description: "Name of the new folder",
	},
	{
		displayName: "Workspace ID",
		name: "workspaceId",
		type: "string",
		required: true,
		default: "",
		displayOptions: {
			show: {
				resource: ["folder"],
				operation: ["create"],
			},
		},
		description: "The ID of the workspace where this folder will be created",
	},
	{
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: {
				resource: ["folder"],
				operation: ["create"],
			},
		},
		options: [
			{
				displayName: "Color",
				name: "color",
				type: "options",
				default: "DONE_GREEN",
				description: "Folder color (FolderColor enum from Monday.com)",
				options: [
					{ name: "Aquamarine", value: "AQUAMARINE" },
					{ name: "Bright Blue", value: "BRIGHT_BLUE" },
					{ name: "Bright Green", value: "BRIGHT_GREEN" },
					{ name: "Chili Blue", value: "CHILI_BLUE" },
					{ name: "Dark Orange", value: "DARK_ORANGE" },
					{ name: "Dark Purple", value: "DARK_PURPLE" },
					{ name: "Dark Red", value: "DARK_RED" },
					{ name: "Done Green", value: "DONE_GREEN" },
					{ name: "Indigo", value: "INDIGO" },
					{ name: "Lipstick", value: "LIPSTICK" },
					{ name: "Purple", value: "PURPLE" },
					{ name: "Sofia Pink", value: "SOFIA_PINK" },
					{ name: "Stuck Red", value: "STUCK_RED" },
					{ name: "Sunset", value: "SUNSET" },
					{ name: "Working Orange", value: "WORKING_ORANGE" },
				],
			},
			{
				displayName: "Parent Folder ID",
				name: "parentFolderId",
				type: "string",
				default: "",
				description:
					"ID of the parent folder to nest this folder under (optional)",
			},
		],
	},
];

export async function folderCreateExecute(this: IExecuteFunctions, i: number) {
	const workspaceId = this.getNodeParameter("workspaceId", i) as string;
	const name = this.getNodeParameter("name", i) as string;
	const additionalFields = this.getNodeParameter("additionalFields", i, {}) as {
		color?: string;
		parentFolderId?: string;
	};

	const body: IGraphqlBody = {
		query: `mutation (
			$workspaceId: ID!,
			$name: String!,
			$color: FolderColor,
			$parentFolderId: ID
		) {
			create_folder(
				workspace_id: $workspaceId,
				name: $name,
				color: $color,
				parent_folder_id: $parentFolderId
			) {
				id
				name
				color
				workspace { id }
				parent { id }
			}
		}`,
		variables: {
			workspaceId,
			name,
			...(additionalFields.color && { color: additionalFields.color }),
			...(additionalFields.parentFolderId &&
				{ parentFolderId: additionalFields.parentFolderId }),
		},
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.create_folder;
}
