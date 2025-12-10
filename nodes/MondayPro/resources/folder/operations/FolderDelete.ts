import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "@types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const folderDelete: INodeProperties[] = [
	{
		displayName: "Folder ID",
		name: "folderId",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["folder"], operation: ["delete"] },
		},
		description: "The ID of the folder to delete",
	},
];

export async function folderDeleteExecute(this: IExecuteFunctions, i: number) {
	const folderId = this.getNodeParameter("folderId", i) as string;

	const body: IGraphqlBody = {
		query: `mutation ($folderId: ID!) {
			delete_folder (folder_id: $folderId) { id }
		}`,
		variables: { folderId },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.delete_folder;
}
