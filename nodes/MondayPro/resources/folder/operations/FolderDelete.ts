import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	extractResourceLocatorValue,
	folderResourceLocator,
} from "../../../utils/resourceLocator";

export const folderDelete: INodeProperties[] = [
	folderResourceLocator({
		displayName: "Folder",
		name: "folderId",
		required: true,
		description: "The folder to delete",
		displayOptions: {
			show: { resource: ["folder"], operation: ["delete"] },
		},
	}),
];

export async function folderDeleteExecute(this: IExecuteFunctions, i: number) {
	const folderId = extractResourceLocatorValue(
		this.getNodeParameter("folderId", i),
	);

	const body: IGraphqlBody = {
		query: `mutation ($folderId: ID!) {
			delete_folder (folder_id: $folderId) { id }
		}`,
		variables: { folderId },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.delete_folder;
}
