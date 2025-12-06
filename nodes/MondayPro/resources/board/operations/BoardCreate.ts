import type { INodeProperties } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-workflow";
import type { IGraphqlBody } from "../../../types";
import { mondayProApiRequest } from "../../../GenericFunctions";

export const boardCreate: INodeProperties[] = [
	{
		displayName: "Name",
		name: "name",
		type: "string",
		required: true,
		default: "",
		displayOptions: { show: { resource: ["board"], operation: ["create"] } },
		description: "The board's name",
	},
	{
		displayName: "Kind",
		name: "kind",
		type: "options",
		default: "private",
		required: true,
		description: "The board's kind (public / private / share)",
		displayOptions: { show: { resource: ["board"], operation: ["create"] } },
		options: [
			{ name: "Share", value: "share" },
			{ name: "Public", value: "public" },
			{ name: "Private", value: "private" },
		],
	},
	{
		displayName: "Additional Fields",
		name: "additionalFields",
		type: "collection",
		placeholder: "Add Field",
		default: {},
		displayOptions: { show: { resource: ["board"], operation: ["create"] } },
		options: [
			{
				displayName: "Template ID",
				name: "templateId",
				type: "number",
				typeOptions: { minValue: 0 },
				default: 0,
				description: "Optional board template ID",
			},
		],
	},
];

export async function boardCreateExecute(this: IExecuteFunctions, i: number) {
	const name = this.getNodeParameter("name", i) as string;
	const kind = this.getNodeParameter("kind", i) as string;
	const additionalFields = this.getNodeParameter("additionalFields", i, {}) as {
		templateId?: number;
	};
	const body: IGraphqlBody = {
		query: `mutation ($name: String!, $kind: BoardKind!, $templateId: ID) {
				create_board (board_name: $name, board_kind: $kind, template_id: $templateId) {
					id
				}
			}`,
		variables: {
			name,
			kind,
			...(additionalFields.templateId &&
				{ templateId: additionalFields.templateId }),
		},
	};
	const response = await mondayProApiRequest.call(this, body);
	return response.data.create_board;
}
