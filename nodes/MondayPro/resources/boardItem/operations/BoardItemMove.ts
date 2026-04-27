import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	boardResourceLocator,
	extractResourceLocatorValue,
	groupResourceLocator,
	itemResourceLocator,
} from "../../../utils/resourceLocator";

export const boardItemMove: INodeProperties[] = [
	boardResourceLocator({
		displayName: "Board",
		name: "boardId",
		required: true,
		description: "The board the item belongs to",
		displayOptions: { show: { resource: ["boardItem"], operation: ["move"] } },
	}),
	itemResourceLocator({
		displayName: "Item",
		name: "itemId",
		required: true,
		description: "The item to move",
		displayOptions: { show: { resource: ["boardItem"], operation: ["move"] } },
	}),
	groupResourceLocator({
		displayName: "Group",
		name: "groupId",
		required: true,
		description: "The destination group",
		displayOptions: { show: { resource: ["boardItem"], operation: ["move"] } },
	}),
];

export async function boardItemMoveExecute(this: IExecuteFunctions, i: number) {
	const groupId = extractResourceLocatorValue(
		this.getNodeParameter("groupId", i),
	);
	const itemId = extractResourceLocatorValue(
		this.getNodeParameter("itemId", i),
	);

	const body: IGraphqlBody = {
		query: `mutation ($groupId: String!, $itemId: ID!) {
			move_item_to_group (group_id: $groupId, item_id: $itemId) { id }
		}`,
		variables: { groupId, itemId },
	};

	const response = await mondayProApiRequest.call(this, body);
	return response.data.move_item_to_group;
}
