import type { INodeProperties } from "n8n-workflow";

export const folderOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["folder"],
			},
		},
		options: [
			{
				name: "Create",
				value: "create",
				description: "Create a folder inside a workspace",
				action: "Create folder",
			},
			{
				name: "Get Many",
				value: "getAll",
				description: "List folders in one or more workspaces",
				action: "Get many folders",
			},
			{
				name: "Update",
				value: "update",
				description: "Update an existing folder",
				action: "Update folder",
			},
			{
				name: "Delete",
				value: "delete",
				description: "Delete a folder",
				action: "Delete folder",
			},
		],
		default: "create",
	},
];

export const folderFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                  folder:getAll                             */
	/* -------------------------------------------------------------------------- */
	{
		displayName: "Workspace IDs",
		name: "workspaceIds",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				resource: ["folder"],
				operation: ["getAll"],
			},
		},
		description:
			'Comma-separated list of workspace IDs to fetch folders from. Use "null" to include Main Workspace.',
	},
	{
		displayName: "Folder IDs",
		name: "folderIds",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				resource: ["folder"],
				operation: ["getAll"],
			},
		},
		description:
			"Optional comma-separated list of specific folder IDs to return",
	},
	{
		displayName: "Fields",
		name: "fields",
		type: "multiOptions",
		displayOptions: {
			show: {
				resource: ["folder"],
				operation: ["getAll"],
			},
		},
		options: [
			{
				name: "ID",
				value: "id",
			},
			{
				name: "Name",
				value: "name",
			},
			{
				name: "Color",
				value: "color",
			},
			{
				name: "Created At",
				value: "created_at",
			},
			{
				name: "Owner ID",
				value: "owner_id",
			},
			{
				name: "Children (Boards)",
				value: "children",
			},
			{
				name: "Parent Folder",
				value: "parent",
			},
			{
				name: "Subfolders",
				value: "sub_folders",
			},
			{
				name: "Workspace",
				value: "workspace",
			},
		],
		default: ["id", "name", "color"],
		description: "Select which fields to return for each folder",
	},
	{
		displayName: "Return All",
		name: "returnAll",
		type: "boolean",
		default: true,
		displayOptions: {
			show: {
				resource: ["folder"],
				operation: ["getAll"],
			},
		},
		description: "Whether to return all results or only up to a given limit",
	},
	{
		displayName: "Limit",
		name: "limit",
		type: "number",
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 25,
		displayOptions: {
			show: {
				resource: ["folder"],
				operation: ["getAll"],
				returnAll: [false],
			},
		},
		description: "Max number of results to return",
	},
	/* -------------------------------------------------------------------------- */
	/*                                folder:create                         */
	/* -------------------------------------------------------------------------- */
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
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["folder"],
				operation: ["create"],
			},
		},
		description: "The ID of the workspace",
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
				default: "",
				description:
					'Folder color (FolderColor enum value from monday.com, e.g. "PURPLE").',
				options: [
					{ name: "Done Green", value: "DONE_GREEN" },
					{ name: "Bright Green", value: "BRIGHT_GREEN" },
					{ name: "Working Orange", value: "WORKING_ORANGE" },
					{ name: "Dark Orange", value: "DARK_ORANGE" },
					{ name: "Sunset", value: "SUNSET" },
					{ name: "Stuck Red", value: "STUCK_RED" },
					{ name: "Dark Red", value: "DARK_RED" },
					{ name: "Sofia Pink", value: "SOFIA_PINK" },
					{ name: "Lipstick", value: "LIPSTICK" },
					{ name: "Purple", value: "PURPLE" },
					{ name: "Dark Purple", value: "DARK_PURPLE" },
					{ name: "Indigo", value: "INDIGO" },
					{ name: "Bright Blue", value: "BRIGHT_BLUE" },
					{ name: "Aquamarine", value: "AQUAMARINE" },
					{ name: "Chili Blue", value: "CHILI_BLUE" },
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
	/* -------------------------------------------------------------------------- */
	/*                                folder:update                         */
	/* -------------------------------------------------------------------------- */
	{
		displayName: "Folder ID",
		name: "folderId",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["folder"],
				operation: ["update"],
			},
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
			show: {
				resource: ["folder"],
				operation: ["update"],
			},
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
				default: "",
				description:
					'Folder color (FolderColor enum value from monday.com, e.g. "PURPLE").',
				options: [
					{ name: "Done Green", value: "DONE_GREEN" },
					{ name: "Bright Green", value: "BRIGHT_GREEN" },
					{ name: "Working Orange", value: "WORKING_ORANGE" },
					{ name: "Dark Orange", value: "DARK_ORANGE" },
					{ name: "Sunset", value: "SUNSET" },
					{ name: "Stuck Red", value: "STUCK_RED" },
					{ name: "Dark Red", value: "DARK_RED" },
					{ name: "Sofia Pink", value: "SOFIA_PINK" },
					{ name: "Lipstick", value: "LIPSTICK" },
					{ name: "Purple", value: "PURPLE" },
					{ name: "Dark Purple", value: "DARK_PURPLE" },
					{ name: "Indigo", value: "INDIGO" },
					{ name: "Bright Blue", value: "BRIGHT_BLUE" },
					{ name: "Aquamarine", value: "AQUAMARINE" },
					{ name: "Chili Blue", value: "CHILI_BLUE" },
				],
			},
			{
				displayName: "Parent Folder ID",
				name: "parentFolderId",
				type: "string",
				default: "",
				description: "ID of the new parent folder to nest this folder under",
			},
			{
				displayName: "Workspace ID",
				name: "workspaceId",
				type: "string",
				default: "",
				description:
					"ID of the workspace to move this folder to (must be in the same account product)",
			},
		],
	},
	/* -------------------------------------------------------------------------- */
	/*                                folder:delete                         */
	/* -------------------------------------------------------------------------- */
	{
		displayName: "Folder ID",
		name: "folderId",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["folder"],
				operation: ["delete"],
			},
		},
		description: "The ID of the folder to delete",
	},
];
