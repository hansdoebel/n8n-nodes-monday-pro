import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IDataObject } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const folderGetAll: INodeProperties[] = [
	{
		displayName: "Workspace IDs",
		name: "workspaceIds",
		type: "string",
		default: "",
		displayOptions: {
			show: { resource: ["folder"], operation: ["getAll"] },
		},
		description:
			'Comma-separated list of workspace IDs (use "null" for Main Workspace)',
	},
	{
		displayName: "Folder IDs",
		name: "folderIds",
		type: "string",
		default: "",
		displayOptions: {
			show: { resource: ["folder"], operation: ["getAll"] },
		},
		description: "Optional comma-separated list of folder IDs to return",
	},
	{
		displayName: "Fields",
		name: "fields",
		type: "multiOptions",
		displayOptions: {
			show: { resource: ["folder"], operation: ["getAll"] },
		},
		options: [
			{ name: "Children (Boards)", value: "children" },
			{ name: "Color", value: "color" },
			{ name: "Created At", value: "created_at" },
			{ name: "ID", value: "id" },
			{ name: "Name", value: "name" },
			{ name: "Owner ID", value: "owner_id" },
			{ name: "Parent Folder", value: "parent" },
			{ name: "Subfolders", value: "sub_folders" },
			{ name: "Workspace", value: "workspace" },
		],
		default: ["id", "name"],
		description: "Select which fields to return for each folder",
	},
	{
		displayName: "Return All",
		name: "returnAll",
		type: "boolean",
		default: true,
		displayOptions: {
			show: { resource: ["folder"], operation: ["getAll"] },
		},
		description: "Whether to return all results or only up to a given limit",
	},
	{
		displayName: "Limit",
		name: "limit",
		type: "number",
		typeOptions: { minValue: 1 },
		default: 50,
		displayOptions: {
			show: {
				resource: ["folder"],
				operation: ["getAll"],
				returnAll: [false],
			},
		},
		description: "Max number of results to return",
	},
];

export async function folderGetAllExecute(this: IExecuteFunctions, i: number) {
	const workspaceIdsRaw = this.getNodeParameter(
		"workspaceIds",
		i,
		"",
	) as string;
	const folderIdsRaw = this.getNodeParameter("folderIds", i, "") as string;
	const returnAll = this.getNodeParameter("returnAll", i) as boolean;
	const selectedFields = this.getNodeParameter("fields", i, []) as string[];

	const workspace_ids =
		workspaceIdsRaw?.split(",").map((id) => id.trim()).filter(Boolean) ||
		undefined;
	const ids = folderIdsRaw?.split(",").map((id) => id.trim()).filter(Boolean) ||
		undefined;
	const limit = returnAll ? 100 : (this.getNodeParameter("limit", i) as number);

	const fieldMap: Record<string, string> = {
		id: "id",
		name: "name",
		color: "color",
		created_at: "created_at",
		owner_id: "owner_id",
		children: "children { id name }",
		parent: "parent { id name }",
		sub_folders: "sub_folders { id name }",
		workspace: "workspace { id name }",
	};
	const fieldsToUse =
		(selectedFields.length ? selectedFields : ["id", "name", "color"])
			.map((f) => fieldMap[f])
			.filter(Boolean)
			.join("\n");

	const body: IGraphqlBody = {
		query: `query ($workspace_ids: [ID], $ids: [ID!], $limit: Int) {
			folders(workspace_ids: $workspace_ids, ids: $ids, limit: $limit) {
				${fieldsToUse}
			}
		}`,
		variables: {
			limit,
			...(workspace_ids && { workspace_ids }),
			...(ids && { ids }),
		},
	};

	const response = await mondayProApiRequest.call(this, body);
	let folders = (response.data.folders ?? []) as IDataObject[];

	if (!returnAll) folders = folders.slice(0, limit);
	return folders;
}
