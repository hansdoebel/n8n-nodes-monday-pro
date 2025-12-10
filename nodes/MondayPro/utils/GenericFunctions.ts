import get from "lodash/get";
import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	JsonObject,
} from "n8n-workflow";
import { NodeApiError } from "n8n-workflow";
import {
	API_CONFIG,
	API_HEADERS,
	AuthenticationMethod,
	CREDENTIAL_TYPES,
	NODE_PARAMETER_NAMES,
	PAGINATION_CONFIG,
} from "@types";

export async function mondayProApiRequest(
	this:
		| IExecuteFunctions
		| IWebhookFunctions
		| IHookFunctions
		| ILoadOptionsFunctions,
	body: any = {},
	option: IDataObject = {},
): Promise<any> {
	const authenticationMethod = this.getNodeParameter(
		NODE_PARAMETER_NAMES.AUTHENTICATION,
		0,
	) as AuthenticationMethod;

	const options: IHttpRequestOptions = {
		headers: API_HEADERS,
		method: API_CONFIG.METHOD,
		body,
		url: API_CONFIG.BASE_URL,
		json: true,
	};

	const mergedOptions = Object.assign({}, options, option);

	try {
		const credentialType = authenticationMethod === AuthenticationMethod.OAUTH2
			? CREDENTIAL_TYPES.OAUTH2
			: CREDENTIAL_TYPES.ACCESS_TOKEN;

		return await this.helpers.requestWithAuthentication.call(
			this,
			credentialType,
			mergedOptions,
		);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function mondayProApiRequestAllItems(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	propertyName: string,
	body: any = {},
): Promise<any> {
	const returnData: IDataObject[] = [];

	let responseData;
	body.variables.limit = PAGINATION_CONFIG.DEFAULT_LIMIT;
	body.variables.page = PAGINATION_CONFIG.INITIAL_PAGE;

	do {
		responseData = await mondayProApiRequest.call(this, body);
		returnData.push.apply(
			returnData,
			get(responseData, propertyName) as IDataObject[],
		);
		body.variables.page++;
	} while (get(responseData, propertyName).length > 0);
	return returnData;
}

export async function mondayProApiPaginatedRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	itemsPath: string,
	fieldsToReturn: string,
	body: IDataObject = {},
) {
	const returnData: IDataObject[] = [];

	const initialResponse = await mondayProApiRequest.call(this, body);
	const data = get(initialResponse, itemsPath) as IDataObject;

	if (data) {
		returnData.push.apply(returnData, data.items as IDataObject[]);

		let cursor: null | string = data.cursor as string;

		while (cursor) {
			const responseData = (
				(await mondayProApiRequest.call(this, {
					query:
						`query ( $cursor: String!) { next_items_page (cursor: $cursor, limit: ${PAGINATION_CONFIG.MAX_LIMIT}) { cursor items ${fieldsToReturn} } }`,
					variables: {
						cursor,
					},
				})) as IDataObject
			).data as { next_items_page: { cursor: string; items: IDataObject[] } };

			if (responseData && responseData.next_items_page) {
				returnData.push.apply(returnData, responseData.next_items_page.items);
				cursor = responseData.next_items_page.cursor;
			} else {
				cursor = null;
			}
		}
	}

	return returnData;
}

export function buildItemFieldsGraphQL(
	config: Record<string, any>,
	indent = 4,
): string {
	const pad = " ".repeat(indent);
	return Object.entries(config)
		.map(([key, value]) => {
			if (value === true) return `${pad}${key}`;
			if (typeof value === "object") {
				return `${pad}${key} {\n${
					buildItemFieldsGraphQL(value, indent + 2)
				}\n${pad}}`;
			}
			return "";
		})
		.join("\n");
}

export function jsonToGraphqlFields(
	obj: IDataObject | null | undefined,
): string {
	const build = (o: IDataObject): string => {
		if (!o) return "";

		return Object.entries(o as Record<string, unknown>)
			.map(([key, value]) => {
				if (value === true) return key;

				if (value && typeof value === "object" && !Array.isArray(value)) {
					const args: string[] = [];
					const subFields: string[] = [];

					for (
						const [k, v] of Object.entries(
							value as Record<string, unknown>,
						)
					) {
						if (k === "fields") {
							subFields.push(...(v as string[]));
							continue;
						}
						args.push(`${k}: ${JSON.stringify(v)}`);
					}

					const argString = args.length > 0 ? `(${args.join(", ")})` : "";
					const subString = subFields.length > 0
						? ` {\n${subFields.join("\n")}\n}`
						: "";

					return `${key}${argString}${subString}`;
				}

				return "";
			})
			.filter((line) => line !== "")
			.join("\n");
	};

	if (!obj) return "{}";

	return `{${build(obj)}\n}`;
}
