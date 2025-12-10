import type { INodeProperties } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const boardUpdateHierarchy: INodeProperties[] = [
	{
		displayName: "Board Name or ID",
		name: "boardId",
		type: "options",
		typeOptions: { loadOptionsMethod: "getBoards" },
		default: "",
		required: true,
		displayOptions: {
			show: { resource: ["board"], operation: ["updateHierarchy"] },
		},
		description:
			'Board unique identifier. Choose from the list or specify by ID using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		required: true,
		displayOptions: {
			show: { resource: ["board"], operation: ["updateHierarchy"] },
		},
		options: [
			{
				displayName: "Account Product ID",
				name: "accountProductId",
				type: "number",
				default: 0,
			},
			{
				displayName: "Folder ID",
				name: "folderId",
				type: "number",
				default: 0,
			},
			{
				displayName: "Workspace ID",
				name: "workspaceId",
				type: "number",
				default: 0,
			},
			{
				displayName: "Position",
				name: "position",
				type: "collection",
				default: {},
				description: "The position configuration for the board",
				options: [
					{
						displayName: "Is After",
						name: "isAfter",
						type: "boolean",
						default: true,
						description: "Whether to position after the object",
					},
					{
						displayName: "Object ID",
						name: "objectId",
						type: "string",
						default: "",
						description: "The object ID for positioning",
					},
					{
						displayName: "Object Type",
						name: "objectType",
						type: "options",
						default: "Overview",
						description: "The object type for positioning",
						options: [
							{ name: "Board", value: "Board" },
							{ name: "Folder", value: "Folder" },
							{ name: "Overview", value: "Overview" },
						],
					},
				],
			},
		],
	},
];

export async function boardUpdateHierarchyExecute(
	this: IExecuteFunctions,
	i: number,
) {
	const boardId = this.getNodeParameter("boardId", i);
	const additionalFieldsParam = this.getNodeParameter(
		"additionalFields",
		i,
		{},
	) as {
		accountProductId?: number;
		folderId?: number;
		workspaceId?: number;
		position?: {
			objectId?: string;
			objectType?: string;
			isAfter?: boolean;
		};
	};

	const variables: Record<string, any> = { boardId };
	const queryParams: string[] = ["$boardId: ID!"];
	const attributeFields: string[] = [];

	if (additionalFieldsParam.accountProductId) {
		variables.accountProductId = String(
			additionalFieldsParam.accountProductId,
		);
		queryParams.push("$accountProductId: ID");
		attributeFields.push("account_product_id: $accountProductId");
	}

	if (additionalFieldsParam.folderId) {
		variables.folderId = String(additionalFieldsParam.folderId);
		queryParams.push("$folderId: ID");
		attributeFields.push("folder_id: $folderId");
	}

	if (additionalFieldsParam.workspaceId) {
		variables.workspaceId = String(additionalFieldsParam.workspaceId);
		queryParams.push("$workspaceId: ID");
		attributeFields.push("workspace_id: $workspaceId");
	}

	if (
		additionalFieldsParam.position &&
		Object.keys(additionalFieldsParam.position).length > 0
	) {
		const position: Record<string, any> = {};
		if (additionalFieldsParam.position.objectId) {
			position.object_id = additionalFieldsParam.position.objectId;
		}
		if (additionalFieldsParam.position.objectType) {
			position.object_type = additionalFieldsParam.position.objectType;
		}
		if (additionalFieldsParam.position.isAfter !== undefined) {
			position.is_after = additionalFieldsParam.position.isAfter;
		}
		if (Object.keys(position).length > 0) {
			variables.position = position;
			queryParams.push("$position: DynamicPosition");
			attributeFields.push("position: $position");
		}
	}

	if (attributeFields.length === 0) {
		throw new Error("At least one attribute must be provided");
	}

	const query = `mutation (${queryParams.join(", ")}) {
		update_board_hierarchy(board_id: $boardId, attributes: { ${
		attributeFields.join(
			", ",
		)
	} }) {
			success
		}
	}`;

	const body: IGraphqlBody = {
		query,
		variables,
	};

	const response = await mondayProApiRequest.call(this, body);

	if (!response) {
		throw new Error("No response from API");
	}

	if (response.errors) {
		const errorMessage = response.errors
			.map((err: any) => err.message)
			.join(", ");
		throw new Error(`GraphQL Error: ${errorMessage}`);
	}

	if (!response.data) {
		throw new Error(
			`Invalid API response structure: ${JSON.stringify(response)}`,
		);
	}

	if (!response.data.update_board_hierarchy) {
		throw new Error(
			`Board hierarchy update failed: ${JSON.stringify(response.data)}`,
		);
	}

	let parsedResponse = response.data.update_board_hierarchy;

	if (typeof parsedResponse === "string") {
		try {
			parsedResponse = JSON.parse(parsedResponse);
		} catch (e) {
			throw new Error(
				`Failed to parse update_board_hierarchy response: ${parsedResponse}. Error: ${
					(e as Error).message
				}`,
			);
		}
	}

	if (!parsedResponse.success) {
		throw new Error(
			`Board hierarchy update failed: success is false. Response: ${
				JSON.stringify(parsedResponse)
			}`,
		);
	}

	return {
		success: parsedResponse.success,
		boardId,
		additionalFields: additionalFieldsParam,
	};
}
