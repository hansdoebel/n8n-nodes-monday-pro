import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from "n8n-workflow";

export class MondayProApi implements ICredentialType {
	name = "mondayProApi";

	displayName = "Monday.com (Pro) API";

	documentationUrl = "mondaycom";

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
				"API-Version": "2025-10",
				"Content-Type": "application/json",
			},
			baseURL: "https://api.monday.com/v2",
			method: "POST",
			body: JSON.stringify({
				query: "query { me { name }}",
			}),
		},
	};
}
