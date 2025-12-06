import type { INodeProperties } from "n8n-workflow";
import * as operations from "./operations";

export const boardItemOperations: INodeProperties[] = [
	{
		displayName: "Operation",
		name: "operation",
		type: "options",
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ["boardItem"],
			},
		},
		options: [
			{
				name: "Add Update",
				value: "addUpdate",
				description: "Add an update to an item",
				action: "Add an update to an item",
			},
			{
				name: "Change Column Value",
				value: "changeColumnValue",
				description: "Change a column value for a board item",
				action: "Change a column value for a board item",
			},
			{
				name: "Change Multiple Column Values",
				value: "changeMultipleColumnValues",
				description: "Change multiple column values for a board item",
				action: "Change multiple column values for a board item",
			},
			{
				name: "Create",
				value: "create",
				description: "Create an item in a board's group",
				action: "Create an item in a board s group",
			},
			{
				name: "Delete",
				value: "delete",
				description: "Delete an item",
				action: "Delete an item",
			},
			{
				name: "Get",
				value: "get",
				description: "Get an item",
				action: "Get an item",
			},
			{
				name: "Get By Column Value",
				value: "getByColumnValue",
				description: "Get items by column value",
				action: "Get items item by column value",
			},
			{
				name: "Get Filtered",
				value: "getFiltered",
				action: "Get filtered items",
				description:
					"Get items from a board using items_page filters (query_params.rules)",
			},
			{
				name: "Get Many",
				value: "getAll",
				description: "Get many items",
				action: "Get many items",
			},
			{
				name: "Move",
				value: "move",
				description: "Move item to group",
				action: "Move an item to a group",
			},
		],
		default: "create",
	},
];

const boardItemFieldArrays = Object.values(operations).filter(
	(v): v is INodeProperties[] => Array.isArray(v),
);

export const boardItemDescription: INodeProperties[] = [
	...boardItemOperations,
	...boardItemFieldArrays.flat(),
];
