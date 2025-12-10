import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "@types";
import {
	mondayProApiPaginatedRequest,
	mondayProApiRequest,
} from "@utils/GenericFunctions";

export const boardItemGetAll: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: { loadOptionsMethod: "getBoards" },
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["getAll"] },
		},
	},
	{
		displayName: "Group Name or ID",
		name: "groupId",
		type: "options",
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: {
			loadOptionsMethod: "getGroups",
			loadOptionsDependsOn: ["boardId"],
		},
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["getAll"] },
		},
	},
	{
		displayName: "Return All",
		name: "returnAll",
		type: "boolean",
		description: "Whether to return all results or only up to a given limit",
		default: false,
		displayOptions: {
			show: { resource: ["boardItem"], operation: ["getAll"] },
		},
	},
	{
		displayName: "Limit",
		name: "limit",
		type: "number",
		description: "Max number of results to return",
		typeOptions: { minValue: 1 },
		default: 50,
		displayOptions: {
			show: {
				resource: ["boardItem"],
				operation: ["getAll"],
				returnAll: [false],
			},
		},
	},
];

export async function boardItemGetAllExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = this.getNodeParameter("boardId", i);
	const groupId = this.getNodeParameter("groupId", i);
	const returnAll = this.getNodeParameter("returnAll", i);

	const fieldsToReturn = `
{
	id
	name
	created_at
	state
	column_values {
		id
		text
		type
		value
		column {
			title
			archived
			description
			settings_str
		}
	}
}`;

	const body: IGraphqlBody = {
		query: `query ($boardId: [ID!], $groupId: [String], $limit: Int) {
			boards(ids: $boardId) {
				groups(ids: $groupId) {
					id
					items_page(limit: $limit) {
						cursor
						items ${fieldsToReturn}
					}
				}
			}
		}`,
		variables: { boardId, groupId, limit: 100 },
	};

	if (returnAll) {
		return await mondayProApiPaginatedRequest.call(
			this,
			"data.boards[0].groups[0].items_page",
			fieldsToReturn,
			body,
		);
	}

	body.variables.limit = this.getNodeParameter("limit", i);
	const response = await mondayProApiRequest.call(this, body);
	return response.data.boards[0].groups[0].items_page.items;
}
