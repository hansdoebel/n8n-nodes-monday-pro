import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	docResourceLocator,
	extractResourceLocatorValue,
} from "../../../utils/resourceLocator";

export const docsGetDescription: INodeProperties[] = [
	docResourceLocator({
		displayName: "Doc",
		name: "docId",
		required: true,
		description: "The doc to retrieve",
		displayOptions: { show: { resource: ["docs"], operation: ["get"] } },
	}),
];

export async function docsGetExecute(this: IExecuteFunctions, i: number) {
	const docId = extractResourceLocatorValue(
		this.getNodeParameter("docId", i),
	);

	const body: IGraphqlBody = {
		query: `query ($docId: ID!) {
			docs(ids: [$docId]) {
				id
				name
			}
		}`,
		variables: { docId },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.docs;
}
