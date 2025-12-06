import type { INodeProperties } from "n8n-workflow";
import * as operations from "./operations";

export const boardSubitemOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["boardSubitem"],
			},
		},
		options: [
			{
				name: "Create",
				value: "create",
				description: "Create a subitem under a parent item",
				action: "Create subitem",
			},
		],
		default: "create",
	},
];

const boardSubitemFieldArrays = Object.values(operations).filter(
	(v): v is INodeProperties[] => Array.isArray(v),
);

export const boardSubitemDescription: INodeProperties[] = [
	...boardSubitemOperations,
	...boardSubitemFieldArrays.flat(),
];
