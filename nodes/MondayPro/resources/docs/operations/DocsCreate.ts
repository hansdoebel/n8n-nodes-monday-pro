import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../GenericFunctions";

export const docsCreateDescription: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		typeOptions: { loadOptionsMethod: "getBoards" },
		default: "",
		required: true,
		displayOptions: { show: { resource: ["docs"], operation: ["create"] } },
		description: 'Choose from the list or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: "Title",
		name: "title",
		type: "string",
		default: "",
		required: true,
		displayOptions: { show: { resource: ["docs"], operation: ["create"] } },
		description: "The new document's title",
	},
	{
		displayName: "Content",
		name: "content",
		type: "string",
		typeOptions: { rows: 4 },
		default: "",
		required: true,
		displayOptions: { show: { resource: ["docs"], operation: ["create"] } },
		description: "Markdown or plain text content for the doc",
	},
];

export async function docsCreateExecute(this: IExecuteFunctions, i: number) {
	const boardId = this.getNodeParameter("boardId", i);
	const title = this.getNodeParameter("title", i) as string;
	const content = this.getNodeParameter("content", i) as string;

	const body: IGraphqlBody = {
		query: `mutation ($boardId: ID!, $title: String!, $content: String!) {
			create_doc (board_id: $boardId, title: $title, content: $content) {
				id
				board_id
				title
				created_at
				creator_id
			}
		}`,
		variables: { boardId, title, content },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.create_doc;
}
