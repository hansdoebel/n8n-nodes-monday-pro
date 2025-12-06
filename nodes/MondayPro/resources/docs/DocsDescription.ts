import type { INodeProperties } from "n8n-workflow";
import * as operations from "./operations";

export const docsOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: { show: { resource: ["docs"] } },
		options: [
			{
				name: "Create",
				value: "create",
				description: "Create a new doc",
				action: "Create doc",
			},
			{
				name: "Get",
				value: "get",
				description: "Retrieve a doc by ID",
				action: "Get doc",
			},
			{
				name: "Delete",
				value: "delete",
				description: "Delete a doc by ID",
				action: "Delete doc",
			},
		],
		default: "create",
	},
];

const docsFieldArrays = Object.values(operations).filter(
	(v): v is INodeProperties[] => Array.isArray(v),
);

export const docsDescription: INodeProperties[] = [
	...docsOperations,
	...docsFieldArrays.flat(),
];
