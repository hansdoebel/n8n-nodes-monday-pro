import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	docResourceLocator,
	extractResourceLocatorValue,
} from "../../../utils/resourceLocator";

export const docsDeleteDescription: INodeProperties[] = [
	docResourceLocator({
		displayName: "Doc",
		name: "docId",
		required: true,
		description: "The doc to delete",
		displayOptions: { show: { resource: ["docs"], operation: ["delete"] } },
	}),
];

export async function docsDeleteExecute(this: IExecuteFunctions, i: number) {
	const docId = extractResourceLocatorValue(
		this.getNodeParameter("docId", i),
	);

	const body: IGraphqlBody = {
		query: `mutation ($docId: ID!) { delete_doc (docId: $docId)	}`,
		variables: { docId },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.delete_doc;
}
