import { snakeCase } from "change-case";
import {
	type IExecuteFunctions,
	INodeProperties,
	NodeOperationError,
} from "n8n-workflow";
import type { IGraphqlBody } from "@types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const boardColumnCreate: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsMethod: "getBoards",
		},
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["boardColumn"],
				operation: ["create"],
			},
		},
	},
	{
		displayName: "Title",
		name: "title",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["boardColumn"],
				operation: ["create"],
			},
		},
	},
	{
		displayName: "Column Type",
		name: "columnType",
		type: "options",
		default: "text",
		options: [
			{ name: "Checkbox", value: "checkbox" },
			{ name: "Country", value: "country" },
			{ name: "Date", value: "date" },
			{ name: "Dropdown", value: "dropdown" },
			{ name: "Email", value: "email" },
			{ name: "Hour", value: "hour" },
			{ name: "Link", value: "Link" },
			{ name: "Long Text", value: "longText" },
			{ name: "Numbers", value: "numbers" },
			{ name: "People", value: "people" },
			{ name: "Person", value: "person" },
			{ name: "Phone", value: "phone" },
			{ name: "Rating", value: "rating" },
			{ name: "Status", value: "status" },
			{ name: "Tags", value: "tags" },
			{ name: "Team", value: "team" },
			{ name: "Text", value: "text" },
			{ name: "Timeline", value: "timeline" },
			{ name: "Timezone", value: "timezone" },
			{ name: "Week", value: "week" },
			{ name: "World Clock", value: "worldClock" },
		],
		required: true,
		displayOptions: {
			show: {
				resource: ["boardColumn"],
				operation: ["create"],
			},
		},
	},
	{
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		displayOptions: {
			show: {
				resource: ["boardColumn"],
				operation: ["create"],
			},
		},
		default: {},
		options: [
			{
				displayName: "Defaults",
				name: "defaults",
				type: "json",
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				default: "",
				description: "The new column's defaults",
			},
		],
	},
];

export async function boardColumnCreateExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = this.getNodeParameter("boardId", i);
	const title = this.getNodeParameter("title", i) as string;
	const columnType = this.getNodeParameter("columnType", i) as string;
	const additionalFields = this.getNodeParameter("additionalFields", i, {}) as {
		defaults?: string;
	};

	const body: IGraphqlBody = {
		query: `mutation (
			$boardId: ID!,
			$title: String!,
			$columnType: ColumnType!,
			$defaults: JSON
		) {
			create_column(
				board_id: $boardId,
				title: $title,
				column_type: $columnType,
				defaults: $defaults
			) {
				id
			}
		}`,
		variables: {
			boardId,
			title,
			columnType: snakeCase(columnType),
		},
	};

	if (additionalFields.defaults) {
		try {
			JSON.parse(additionalFields.defaults as string);
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				"Defaults must be valid JSON",
				{ itemIndex: i },
			);
		}
		body.variables.defaults = JSON.stringify(
			JSON.parse(additionalFields.defaults as string),
		);
	}

	const response = await mondayProApiRequest.call(this, body);
	return response.data.create_column;
}
