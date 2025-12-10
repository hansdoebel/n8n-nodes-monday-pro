import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const docsDeleteDescription: INodeProperties[] = [
	{
		displayName: "Doc ID",
		name: "docId",
		type: "string",
		default: "",
		required: true,
		displayOptions: { show: { resource: ["docs"], operation: ["delete"] } },
		description: "The ID of the doc to delete",
	},
];

export async function docsDeleteExecute(this: IExecuteFunctions, i: number) {
	const docId = this.getNodeParameter("docId", i);

	const body: IGraphqlBody = {
		query: `mutation ($docId: ID!) { delete_doc (docId: $docId)	}`,
		variables: { docId },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.delete_doc;
}
