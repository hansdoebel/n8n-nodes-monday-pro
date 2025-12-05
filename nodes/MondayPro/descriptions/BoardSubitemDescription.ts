import type { INodeProperties } from "n8n-workflow";

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

export const boardSubitemFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                boardSubitem:create                         */
	/* -------------------------------------------------------------------------- */
	{
		displayName: "Parent Item ID",
		name: "itemId",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["boardSubitem"],
				operation: ["create"],
			},
		},
		description: "The ID of the parent item to attach the subitem to",
	},
	{
		displayName: "Subitem Name",
		name: "name",
		type: "string",
		required: true,
		default: "",
		displayOptions: {
			show: {
				resource: ["boardSubitem"],
				operation: ["create"],
			},
		},
		description: "Name of the new subitem",
	},
	{
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: {
			show: {
				resource: ["boardSubitem"],
				operation: ["create"],
			},
		},
		options: [
			{
				displayName: "Column Values",
				name: "columnValues",
				type: "json",
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				default: "",
				description:
					'Subitem column values as JSON, e.g. {"status":{"label":"In progress"}}',
			},
		],
	},
];
