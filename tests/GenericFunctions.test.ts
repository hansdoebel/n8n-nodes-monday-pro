import { ExecuteFunctionsMock } from "./mocks/ExecuteFunctionsMock";
import {
	buildItemFieldsGraphQL,
	jsonToGraphqlFields,
	mondayProApiRequest,
} from "../nodes/MondayPro/GenericFunctions";

describe("GenericFunctions", () => {
	describe("mondayProApiRequest", () => {
		it("should make a successful API request with access token authentication", async () => {
			const mockResponse = { data: { boards: [] } };
			const mockRequestWithAuth = jest.fn().mockResolvedValue(mockResponse);

			const executeFunctions = new ExecuteFunctionsMock(
				{ authentication: "accessToken" },
				{ requestWithAuthentication: mockRequestWithAuth },
			);

			const body = {
				query: "query { boards { id } }",
				variables: {},
			};

			const result = await mondayProApiRequest.call(
				executeFunctions as any,
				body,
			);

			expect(result).toEqual(mockResponse);
			expect(mockRequestWithAuth).toHaveBeenCalledWith(
				"mondayProApi",
				expect.objectContaining({
					method: "POST",
					url: "https://api.monday.com/v2/",
					headers: {
						"API-Version": "2025-10",
						"Content-Type": "application/json",
					},
					body,
					json: true,
				}),
			);
		});

		it("should make a successful API request with OAuth2 authentication", async () => {
			const mockResponse = { data: { boards: [] } };
			const mockRequestWithAuth = jest.fn().mockResolvedValue(mockResponse);

			const executeFunctions = new ExecuteFunctionsMock(
				{ authentication: "oAuth2" },
				{ requestWithAuthentication: mockRequestWithAuth },
			);

			const body = {
				query: "query { boards { id } }",
				variables: {},
			};

			const result = await mondayProApiRequest.call(
				executeFunctions as any,
				body,
			);

			expect(result).toEqual(mockResponse);
			expect(mockRequestWithAuth).toHaveBeenCalledWith(
				"mondayProOAuth2Api",
				expect.any(Object),
			);
		});

		it("should merge custom options with default options", async () => {
			const mockRequestWithAuth = jest.fn().mockResolvedValue({});
			const executeFunctions = new ExecuteFunctionsMock(
				{ authentication: "accessToken" },
				{ requestWithAuthentication: mockRequestWithAuth },
			);

			const body = { query: "test" };
			const customOptions = { timeout: 5000 };

			await mondayProApiRequest.call(
				executeFunctions as any,
				body,
				customOptions,
			);

			expect(mockRequestWithAuth).toHaveBeenCalledWith(
				"mondayProApi",
				expect.objectContaining({
					timeout: 5000,
					method: "POST",
					url: "https://api.monday.com/v2/",
				}),
			);
		});

		it("should throw error on request failure", async () => {
			const mockError = new Error("API Error");
			const mockRequestWithAuth = jest
				.fn()
				.mockRejectedValue(mockError);

			const executeFunctions = new ExecuteFunctionsMock(
				{ authentication: "accessToken" },
				{ requestWithAuthentication: mockRequestWithAuth },
			);

			const body = { query: "test" };

			await expect(
				mondayProApiRequest.call(executeFunctions as any, body),
			).rejects.toThrow();
		});

		it("should handle empty body", async () => {
			const mockResponse = { data: {} };
			const mockRequestWithAuth = jest.fn().mockResolvedValue(mockResponse);

			const executeFunctions = new ExecuteFunctionsMock(
				{ authentication: "accessToken" },
				{ requestWithAuthentication: mockRequestWithAuth },
			);

			const result = await mondayProApiRequest.call(
				executeFunctions as any,
			);

			expect(result).toEqual(mockResponse);
			expect(mockRequestWithAuth).toHaveBeenCalled();
		});
	});

	describe("buildItemFieldsGraphQL", () => {
		it("should build GraphQL fields from config object", () => {
			const config = {
				id: true,
				name: true,
				description: true,
			};

			const result = buildItemFieldsGraphQL(config);

			expect(result).toContain("id");
			expect(result).toContain("name");
			expect(result).toContain("description");
		});

		it("should handle nested objects", () => {
			const config = {
				id: true,
				owner: {
					id: true,
					name: true,
				},
			};

			const result = buildItemFieldsGraphQL(config);

			expect(result).toContain("id");
			expect(result).toContain("owner");
			expect(result).toContain("name");
		});

		it("should respect custom indentation", () => {
			const config = {
				id: true,
				name: true,
			};

			const result = buildItemFieldsGraphQL(config, 2);

			const lines = result.split("\n");
			expect(lines[0]).toBe("  id");
		});

		it("should ignore false values", () => {
			const config = {
				id: true,
				name: false,
				description: true,
			};

			const result = buildItemFieldsGraphQL(config);

			expect(result).toContain("id");
			expect(result).toContain("description");
			expect(result).not.toContain("name");
		});

		it("should handle deeply nested objects", () => {
			const config = {
				id: true,
				board: {
					id: true,
					columns: {
						id: true,
						title: true,
					},
				},
			};

			const result = buildItemFieldsGraphQL(config);

			expect(result).toContain("id");
			expect(result).toContain("board");
			expect(result).toContain("columns");
			expect(result).toContain("title");
		});
	});

	describe("jsonToGraphqlFields", () => {
		it("should convert JSON object to GraphQL fields", () => {
			const obj = {
				id: true,
				name: true,
			};

			const result = jsonToGraphqlFields(obj);

			expect(result).toContain("id");
			expect(result).toContain("name");
			expect(result).toContain("{");
			expect(result).toContain("}");
		});

		it("should handle nested objects with fields array", () => {
			const obj = {
				id: true,
				owner: {
					fields: ["id", "name"],
				},
			};

			const result = jsonToGraphqlFields(obj);

			expect(result).toContain("id");
			expect(result).toContain("owner");
			expect(result).toContain("name");
		});

		it("should handle arguments in nested objects", () => {
			const obj = {
				boards: {
					limit: 10,
					offset: 0,
					fields: ["id", "name"],
				},
			};

			const result = jsonToGraphqlFields(obj);

			expect(result).toContain("boards");
			expect(result).toContain("limit");
			expect(result).toContain("10");
		});

		it("should return empty braces for null", () => {
			const result = jsonToGraphqlFields(null);
			expect(result).toBe("{}");
		});

		it("should return empty braces for undefined", () => {
			const result = jsonToGraphqlFields(undefined);
			expect(result).toBe("{}");
		});

		it("should filter out empty fields", () => {
			const obj = {
				id: true,
				name: "",
				description: true,
			};

			const result = jsonToGraphqlFields(obj);

			expect(result).toContain("id");
			expect(result).toContain("description");
		});

		it("should handle complex nested structure", () => {
			const obj = {
				id: true,
				board: {
					limit: 50,
					fields: ["id", "name", "description"],
				},
				items: {
					offset: 0,
					limit: 100,
					fields: ["id", "name"],
				},
			};

			const result = jsonToGraphqlFields(obj);

			expect(result).toContain("board");
			expect(result).toContain("items");
			expect(result).toContain("id");
			expect(result).toContain("name");
		});
	});
});
