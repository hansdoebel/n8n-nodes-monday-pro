import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from "n8n-workflow";

import { API_CONFIG, CREDENTIAL_TYPES } from "@types";

export class MondayProApi implements ICredentialType {
	name = CREDENTIAL_TYPES.ACCESS_TOKEN;

	displayName = "Monday.com (Pro) API";

	documentationUrl =
		"https://developer.monday.com/api-reference/docs/authentication";

	properties: INodeProperties[] = [
		{
			displayName: "Token V2",
			name: "apiToken",
			type: "string",
			typeOptions: { password: true },
			default: "",
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: "generic",
		properties: {
			headers: {
				Authorization: "=Bearer {{$credentials.apiToken}}",
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			headers: {
				"API-Version": API_CONFIG.VERSION,
				"Content-Type": API_CONFIG.CONTENT_TYPE,
			},
			baseURL: API_CONFIG.BASE_URL,
			method: API_CONFIG.METHOD,
			body: JSON.stringify({
				query: "query { me { name }}",
			}),
		},
	};
}
