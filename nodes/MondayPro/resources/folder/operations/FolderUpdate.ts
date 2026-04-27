import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	extractResourceLocatorValue,
	folderResourceLocator,
	workspaceResourceLocator,
} from "../../../utils/resourceLocator";

export const folderUpdate: INodeProperties[] = [
	folderResourceLocator({
		displayName: "Folder",
		name: "folderId",
		required: true,
		description: "The folder to update",
		displayOptions: {
			show: { resource: ["folder"], operation: ["update"] },
		},
	}),
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
			folderResourceLocator({
				displayName: "Parent Folder",
				name: "parentFolderId",
				description:
					"New parent folder. Cascades from the workspace selected below if set.",
			}),
			workspaceResourceLocator({
				displayName: "Workspace",
				name: "workspaceId",
				description: "Workspace to move this folder to",
			}),
		],
	},
];

export async function folderUpdateExecute(this: IExecuteFunctions, i: number) {
	const folderId = extractResourceLocatorValue(
		this.getNodeParameter("folderId", i),
	);
	const updateFields = this.getNodeParameter("updateFields", i, {}) as {
		name?: string;
		color?: string;
		parentFolderId?: unknown;
		workspaceId?: unknown;
	};
	const parentFolderId = extractResourceLocatorValue(
		updateFields.parentFolderId,
	);
	const workspaceId = extractResourceLocatorValue(updateFields.workspaceId);

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
			...(parentFolderId && { parentFolderId }),
			...(workspaceId && { workspaceId }),
		},
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.update_folder;
}
