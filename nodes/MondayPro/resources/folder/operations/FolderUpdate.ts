import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../GenericFunctions";

export const folderUpdate: INodeProperties[] = [
	{
		displayName: "Folder ID",
		name: "folderId",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["folder"], operation: ["update"] },
		},
		description: "The ID of the folder to update",
	},
	{
		displayName: "Update Fields",
		name: "updateFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: { resource: ["folder"], operation: ["update"] },
		},
		options: [
			{
				displayName: "Name",
				name: "name",
				type: "string",
				default: "",
				description: "New name for the folder",
			},
			{
				displayName: "Color",
				name: "color",
				type: "options",
				default: "DONE_GREEN",
				description: "Folder color value (FolderColor enum)",
				options: [
					{ name: "Aquamarine", value: "AQUAMARINE" },
					{ name: "Bright Blue", value: "BRIGHT_BLUE" },
					{ name: "Bright Green", value: "BRIGHT_GREEN" },
					{ name: "Dark Purple", value: "DARK_PURPLE" },
					{ name: "Dark Red", value: "DARK_RED" },
					{ name: "Done Green", value: "DONE_GREEN" },
				],
			},
			{
				displayName: "Parent Folder ID",
				name: "parentFolderId",
				type: "string",
				default: "",
				description: "ID of the new parent folder",
			},
			{
				displayName: "Workspace ID",
				name: "workspaceId",
				type: "string",
				default: "",
				description: "ID of the workspace to move this folder to",
			},
		],
	},
];

export async function folderUpdateExecute(this: IExecuteFunctions, i: number) {
	const folderId = this.getNodeParameter("folderId", i) as string;
	const updateFields = this.getNodeParameter("updateFields", i, {}) as {
		name?: string;
		color?: string;
		parentFolderId?: string;
		workspaceId?: string;
	};

	const body: IGraphqlBody = {
		query: `mutation (
			$folderId: ID!,
			$name: String,
			$color: FolderColor,
			$parentFolderId: ID,
			$workspaceId: ID
		) {
			update_folder(
				id: $folderId,
				name: $name,
				color: $color,
				parent_folder_id: $parentFolderId,
				workspace_id: $workspaceId
			) {
				id
				name
				color
				workspace { id }
				parent { id }
			}
		}`,
		variables: {
			folderId,
			...(updateFields.name && { name: updateFields.name }),
			...(updateFields.color && { color: updateFields.color }),
			...(updateFields.parentFolderId &&
				{ parentFolderId: updateFields.parentFolderId }),
			...(updateFields.workspaceId &&
				{ workspaceId: updateFields.workspaceId }),
		},
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.update_folder;
}
