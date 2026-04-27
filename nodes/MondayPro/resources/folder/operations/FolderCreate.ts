import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	extractResourceLocatorValue,
	folderResourceLocator,
	workspaceResourceLocator,
} from "../../../utils/resourceLocator";

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
	workspaceResourceLocator({
		displayName: "Workspace",
		name: "workspaceId",
		required: true,
		description: "The workspace where this folder will be created",
		displayOptions: {
			show: { resource: ["folder"], operation: ["create"] },
		},
	}),
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
			folderResourceLocator({
				displayName: "Parent Folder",
				name: "parentFolderId",
				description:
					"Optional parent folder to nest this folder under. Cascades from the selected workspace.",
			}),
		],
	},
];

export async function folderCreateExecute(this: IExecuteFunctions, i: number) {
	const workspaceId = extractResourceLocatorValue(
		this.getNodeParameter("workspaceId", i),
	);
	const name = this.getNodeParameter("name", i) as string;
	const additionalFields = this.getNodeParameter("additionalFields", i, {}) as {
		color?: string;
		parentFolderId?: unknown;
	};
	const parentFolderId = extractResourceLocatorValue(
		additionalFields.parentFolderId,
	);

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
			...(parentFolderId && { parentFolderId }),
		},
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.create_folder;
}
