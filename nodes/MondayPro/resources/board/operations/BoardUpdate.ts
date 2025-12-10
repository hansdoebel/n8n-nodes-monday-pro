import type { INodeProperties } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import type { IGraphqlBody } from "@types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

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
		update_board(board_id: $boardId, board_attribute: $boardAttribute, new_value: $newValue)
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

	let parsedResponse = response.data.update_board;

	if (typeof parsedResponse === "string") {
		try {
			parsedResponse = JSON.parse(parsedResponse);
		} catch (e) {
			throw new Error(
				`Failed to parse update_board response: ${parsedResponse}. Error: ${
					(e as Error).message
				}`,
			);
		}
	}

	if (!parsedResponse.success) {
		throw new Error(
			`Board update failed: success is false. Response: ${
				JSON.stringify(parsedResponse)
			}`,
		);
	}

	return {
		success: parsedResponse.success,
		boardId,
		boardAttribute,
		newValue,
		undoData: parsedResponse.undo_data,
	};
}
