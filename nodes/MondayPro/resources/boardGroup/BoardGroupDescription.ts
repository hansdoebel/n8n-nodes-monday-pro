import type { INodeProperties } from "n8n-workflow";
import * as operations from "./operations";

export const boardGroupOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["boardGroup"],
			},
		},
		options: [
			{
				name: "Delete",
				value: "delete",
				description: "Delete a group in a board",
				action: "Delete a board group",
			},
			{
				name: "Create",
				value: "create",
				description: "Create a group in a board",
				action: "Create a board group",
			},
			{
				name: "Get Many",
				value: "getAll",
				description: "Get list of groups in a board",
				action: "Get many board groups",
			},
		],
		default: "create",
	},
];

const boardGroupFieldArrays = Object.values(operations).filter(
	(v): v is INodeProperties[] => Array.isArray(v),
);

export const boardGroupDescription: INodeProperties[] = [
	...boardGroupOperations,
	...boardGroupFieldArrays.flat(),
];
