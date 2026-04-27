import type {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	boardResourceLocator,
	extractResourceLocatorValue,
	folderResourceLocator,
	workspaceResourceLocator,
} from "../../../utils/resourceLocator";

export const boardUpdateHierarchy: INodeProperties[] = [
	boardResourceLocator({
		displayName: "Board",
		name: "boardId",
		required: true,
		description: "The board whose hierarchy to update",
		displayOptions: {
			show: { resource: ["board"], operation: ["updateHierarchy"] },
		},
	}),
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
			workspaceResourceLocator({
				displayName: "Workspace",
				name: "workspaceId",
				description: "The destination workspace",
			}),
			folderResourceLocator({
				displayName: "Folder",
				name: "folderId",
				description: "The destination folder",
			}),
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
						description:
							"ID of the reference object (Board, Folder, or Overview) to position relative to",
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
	const boardId = extractResourceLocatorValue(
		this.getNodeParameter("boardId", i),
	);
	const additionalFieldsParam = this.getNodeParameter(
		"additionalFields",
		i,
		{},
	) as {
		accountProductId?: number;
		folderId?: unknown;
		workspaceId?: unknown;
		position?: {
			objectId?: string;
			objectType?: string;
			isAfter?: boolean;
		};
	};

	const variables: IDataObject = { boardId };
	const queryParams: string[] = ["$boardId: ID!"];
	const attributeFields: string[] = [];

	if (additionalFieldsParam.accountProductId) {
		variables.accountProductId = String(
			additionalFieldsParam.accountProductId,
		);
		queryParams.push("$accountProductId: ID");
		attributeFields.push("account_product_id: $accountProductId");
	}

	const folderId = extractResourceLocatorValue(additionalFieldsParam.folderId);
	if (folderId) {
		variables.folderId = folderId;
		queryParams.push("$folderId: ID");
		attributeFields.push("folder_id: $folderId");
	}

	const workspaceId = extractResourceLocatorValue(
		additionalFieldsParam.workspaceId,
	);
	if (workspaceId) {
		variables.workspaceId = workspaceId;
		queryParams.push("$workspaceId: ID");
		attributeFields.push("workspace_id: $workspaceId");
	}

	if (
		additionalFieldsParam.position &&
		Object.keys(additionalFieldsParam.position).length > 0
	) {
		const position: IDataObject = {};
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
			.map((err: { message: string }) => err.message)
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
