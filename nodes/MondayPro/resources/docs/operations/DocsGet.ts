import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../GenericFunctions";

export const docsGetDescription: INodeProperties[] = [
	{
		displayName: "Doc ID",
		name: "docId",
		type: "string",
		default: "",
		required: true,
		displayOptions: { show: { resource: ["docs"], operation: ["get"] } },
		description: "The unique identifier of the doc to retrieve",
	},
];

export async function docsGetExecute(this: IExecuteFunctions, i: number) {
	const docId = this.getNodeParameter("docId", i);

	const body: IGraphqlBody = {
		query: `query ($docId: ID!) {
			docs(ids: [$docId]) {
				id
				title
				content
				created_at
				creator_id
				board { id name }
			}
		}`,
		variables: { docId },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.docs;
}
