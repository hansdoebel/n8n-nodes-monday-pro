import type { INodeProperties } from "n8n-workflow";
import * as operations from "./operations";

export const boardColumnOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["boardColumn"],
			},
		},
		options: [
			{
				name: "Create",
				value: "create",
				description: "Create a new column",
				action: "Create a board column",
			},
			{
				name: "Get Many",
				value: "getAll",
				description: "Get many columns",
				action: "Get many board columns",
			},
		],
		default: "create",
	},
];

const boardColumnFieldArrays = Object.values(operations).filter(
	(v): v is INodeProperties[] => Array.isArray(v),
);

export const boardColumnDescription: INodeProperties[] = [
	...boardColumnOperations,
	...boardColumnFieldArrays.flat(),
];
