import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../GenericFunctions";

export const boardItemMove: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		typeOptions: { loadOptionsMethod: "getBoards" },
		default: "",
		required: true,
		displayOptions: { show: { resource: ["boardItem"], operation: ["move"] } },
	},
	{
		displayName: "Item ID",
		name: "itemId",
		type: "string",
		required: true,
		default: "",
		displayOptions: { show: { resource: ["boardItem"], operation: ["move"] } },
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
		displayOptions: { show: { resource: ["boardItem"], operation: ["move"] } },
	},
];

export async function boardItemMoveExecute(this: IExecuteFunctions, i: number) {
	const groupId = this.getNodeParameter("groupId", i) as string;
	const itemId = this.getNodeParameter("itemId", i);

	const body: IGraphqlBody = {
		query: `mutation ($groupId: String!, $itemId: ID!) {
			move_item_to_group (group_id: $groupId, item_id: $itemId) { id }
		}`,
		variables: { groupId, itemId },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.move_item_to_group;
}
