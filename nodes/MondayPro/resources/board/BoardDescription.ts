import type { INodeProperties } from "n8n-workflow";
import * as operations from "./operations";

export const boardOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["board"],
			},
		},
		options: [
			{
				name: "Archive",
				value: "archive",
				description: "Archive a board",
				action: "Archive a board",
			},
			{
				name: "Create",
				value: "create",
				description: "Create a new board",
				action: "Create a board",
			},
			{
				name: "Duplicate",
				value: "duplicate",
				description: "Duplicate a board",
				action: "Duplicate a board",
			},
			{
				name: "Get",
				value: "get",
				description: "Get a board",
				action: "Get a board",
			},
			{
				name: "Get Many",
				value: "getAll",
				description: "Get many boards",
				action: "Get many boards",
			},
		],
		default: "create",
	},
];

const boardFieldArrays = Object.values(operations).filter(
	(v): v is INodeProperties[] => Array.isArray(v),
);

export const boardDescription: INodeProperties[] = [
	...boardOperations,
	...boardFieldArrays.flat(),
];
