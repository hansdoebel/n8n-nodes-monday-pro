import {
	type IExecuteFunctions,
	INodeProperties,
	NodeOperationError,
} from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const boardSubitemCreate: INodeProperties[] = [
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
		default: "",
		required: true,
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

export async function boardSubitemCreateExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const parentItemId = this.getNodeParameter("itemId", i);
	const subitemName = this.getNodeParameter("name", i) as string;
	const additionalFields = this.getNodeParameter("additionalFields", i, {}) as {
		columnValues?: string;
	};

	const body: IGraphqlBody = {
		query:
			`mutation ($parentItemId: ID!, $subitemName: String!, $columnValues: JSON) {
			create_subitem(
				parent_item_id: $parentItemId,
				item_name: $subitemName,
				column_values: $columnValues
			) {
				id
				name
				board { id }
				column_values {
					id
					text
					type
					value
					column {
						title
						archived
						description
						settings_str
					}
				}
			}
		}`,
		variables: { parentItemId, subitemName },
	};

	if (additionalFields.columnValues) {
		try {
			JSON.parse(additionalFields.columnValues);
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				"Column Values must be valid JSON",
				{ itemIndex: i },
			);
		}
		body.variables.columnValues = JSON.stringify(
			JSON.parse(additionalFields.columnValues),
		);
	}

	const response = await mondayProApiRequest.call(this, body);
	return response.data.create_subitem;
}
