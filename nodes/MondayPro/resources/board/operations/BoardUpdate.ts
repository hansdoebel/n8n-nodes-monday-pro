import type { INodeProperties } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../GenericFunctions";

export const boardUpdate: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		typeOptions: { loadOptionsMethod: "getBoards" },
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["board"], operation: ["update"] },
		},
		description:
			'Board unique identifier. Choose from the list or specify by ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: "Board Attribute",
		name: "boardAttribute",
		type: "options",
		required: true,
		default: "name",
		displayOptions: {
			show: { resource: ["board"], operation: ["update"] },
		},
		description: "The board attribute to update",
		options: [
			{ name: "Name", value: "name" },
			{ name: "Description", value: "description" },
			{ name: "Communication", value: "communication" },
		],
	},
	{
		displayName: "New Value",
		name: "newValue",
		type: "string",
		required: true,
		default: "",
		displayOptions: {
			show: { resource: ["board"], operation: ["update"] },
		},
		description: "The new attribute value",
	},
];

export async function boardUpdateExecute(this: IExecuteFunctions, i: number) {
	const boardId = this.getNodeParameter("boardId", i);
	const boardAttribute = this.getNodeParameter("boardAttribute", i) as string;
	const newValue = this.getNodeParameter("newValue", i) as string;

	const query =
		`mutation ($boardId: ID!, $boardAttribute: BoardAttributes!, $newValue: String!) {
		update_board(board_id: $boardId, board_attribute: $boardAttribute, new_value: $newValue) {
			id
			name
			description
		}
	}`;

	const body: IGraphqlBody = {
		query,
		variables: {
			boardId,
			boardAttribute,
			newValue,
		},
	};

	const response = await mondayProApiRequest.call(this, body);

	if (!response) {
		throw new Error("No response from API");
	}

	if (response.errors) {
		const errorMessage = response.errors
			.map((err: any) => err.message)
			.join(", ");
		throw new Error(`GraphQL Error: ${errorMessage}`);
	}

	if (!response.data) {
		throw new Error(
			`Invalid API response structure: ${JSON.stringify(response)}`,
		);
	}

	if (!response.data.update_board) {
		throw new Error(
			`Board update failed: ${JSON.stringify(response.data)}`,
		);
	}

	return response.data.update_board;
}
