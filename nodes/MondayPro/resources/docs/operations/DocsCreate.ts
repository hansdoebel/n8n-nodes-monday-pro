import type { IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { NodeOperationError } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../utils/GenericFunctions";
import {
	extractResourceLocatorValue,
	itemResourceLocator,
	workspaceResourceLocator,
} from "../../../utils/resourceLocator";

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
	workspaceResourceLocator({
		displayName: "Workspace",
		name: "workspaceId",
		required: true,
		description: "The workspace in which to create the doc",
		displayOptions: {
			show: {
				resource: ["docs"],
				operation: ["create"],
				locationType: ["workspace"],
			},
		},
	}),
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
	itemResourceLocator({
		displayName: "Item",
		name: "itemId",
		required: true,
		description: "The item to create the doc on",
		displayOptions: {
			show: {
				resource: ["docs"],
				operation: ["create"],
				locationType: ["board"],
			},
		},
	}),
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
		description: "The ID of the doc column to create the doc in",
	},
];

export async function docsCreateExecute(this: IExecuteFunctions, i: number) {
	const locationType = this.getNodeParameter("locationType", i) as string;

	let location: Record<string, unknown> = {};

	if (locationType === "workspace") {
		const workspaceId = extractResourceLocatorValue(
			this.getNodeParameter("workspaceId", i),
		);
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
		const itemId = extractResourceLocatorValue(
			this.getNodeParameter("itemId", i),
		);
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
