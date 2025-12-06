import type { INodeProperties } from "n8n-workflow";
import * as operations from "./operations";

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

const folderFieldArrays = Object.values(operations).filter(
	(v): v is INodeProperties[] => Array.isArray(v),
);

export const folderDescription: INodeProperties[] = [
	...folderOperations,
	...folderFieldArrays.flat(),
];
