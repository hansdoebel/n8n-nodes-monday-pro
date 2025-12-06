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
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: "Limit",
		name: "limit",
		type: "number",
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ["folder"],
				operation: ["getAll"],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
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
				type: 'color',
				default: "",
				description:
					'Folder color (FolderColor enum value from monday.com, e.g. "purple")',
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
				type: 'color',
				default: "",
				description:
					'Folder color (FolderColor enum value from monday.com, e.g. "purple")',
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
