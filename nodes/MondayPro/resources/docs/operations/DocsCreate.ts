import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "@utils/GenericFunctions";

export const docsCreateDescription: INodeProperties[] = [
	{
		displayName: "Location Type",
		name: "locationType",
		type: "options",
		default: "workspace",
		options: [
			{ name: "Workspace", value: "workspace" },
			{ name: "Board", value: "board" },
		],
		displayOptions: { show: { resource: ["docs"], operation: ["create"] } },
		description: "Where the new doc should be created",
	},
	{
		displayName: "Workspace ID",
		name: "workspaceId",
		type: "string",
		default: "",
		displayOptions: {
			show: {
				resource: ["docs"],
				operation: ["create"],
				locationType: ["workspace"],
			},
		},
		description: "The ID of the workspace in which to create the doc",
		required: true,
	},
	{
		displayName: "Name",
		name: "name",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["docs"],
				operation: ["create"],
				locationType: ["workspace"],
			},
		},
		description: "The new document’s name (for workspace docs)",
	},
	{
		displayName: "Kind",
		name: "kind",
		type: "options",
		default: "private",
		options: [
			{ name: "Private", value: "private" },
			{ name: "Public", value: "public" },
			{ name: "Share", value: "share" },
		],
		displayOptions: {
			show: {
				resource: ["docs"],
				operation: ["create"],
				locationType: ["workspace"],
			},
		},
		description: "Document visibility kind (for workspace docs)",
	},
	{
		displayName: "Item ID",
		name: "itemId",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["docs"],
				operation: ["create"],
				locationType: ["board"],
			},
		},
		description: "The ID of the item to create the doc on",
	},
	{
		displayName: "Column ID",
		name: "columnId",
		type: "string",
		default: "",
		required: true,
		displayOptions: {
			show: {
				resource: ["docs"],
				operation: ["create"],
				locationType: ["board"],
			},
		},
		description: "The ID of the column to create the doc in",
	},
];

export async function docsCreateExecute(this: IExecuteFunctions, i: number) {
	const locationType = this.getNodeParameter("locationType", i) as string;

	let location: Record<string, any> = {};

	if (locationType === "workspace") {
		const workspaceId = this.getNodeParameter("workspaceId", i) as string;
		const name = this.getNodeParameter("name", i) as string;
		const kind = this.getNodeParameter("kind", i) as string;

		location = {
			workspace: {
				workspace_id: Number(workspaceId),
				name,
				kind,
			},
		};
	} else if (locationType === "board") {
		const itemId = this.getNodeParameter("itemId", i) as string;
		const columnId = this.getNodeParameter("columnId", i) as string;

		location = {
			board: {
				item_id: Number(itemId),
				column_id: columnId,
			},
		};
	} else {
		throw new NodeOperationError(this.getNode(), "Invalid location type", {
			itemIndex: i,
		});
	}

	const body: IGraphqlBody = {
		query: `
      mutation CreateDoc($location: CreateDocInput!) {
        create_doc(location: $location) {
          id
        }
      }
    `,
		variables: { location },
	};

	const response = await mondayProApiRequest.call(this, body);

	if (response?.errors?.length) {
		throw new NodeOperationError(
			this.getNode(),
			`Monday.com error: ${response.errors[0].message}`,
			{ itemIndex: i },
		);
	}

	return response.data.create_doc;
}
