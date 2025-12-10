import { boardCreateExecute } from "../../nodes/MondayPro/resources/board/operations/BoardCreate";
import { ExecuteFunctionsMock } from "../mocks/ExecuteFunctionsMock";

jest.mock("@utils/GenericFunctions");

import { mondayProApiRequest } from "@utils/GenericFunctions";

const mockMondayProApiRequest = mondayProApiRequest as jest.MockedFunction<
	typeof mondayProApiRequest
>;

describe("boardCreateExecute", () => {
	beforeEach(() => {
		mockMondayProApiRequest.mockClear();
	});

	describe("happy path scenarios", () => {
		it("should create a board with only required name parameter", async () => {
			const mockExecuteFunctions = new ExecuteFunctionsMock({
				name: "My New Board",
				additionalFields: {},
			});

			const mockResponse = {
				data: {
					create_board: {
						id: "123456",
					},
				},
			};

			mockMondayProApiRequest.mockResolvedValueOnce(mockResponse);

			const result = await boardCreateExecute.call(
				mockExecuteFunctions as any,
				0,
			);

			expect(result).toEqual({ id: "123456" });
		});

		it("should create a board with description", async () => {
			const mockExecuteFunctions = new ExecuteFunctionsMock({
				name: "My Board",
				additionalFields: {
					description: "This is my board",
				},
			});

			const mockResponse = {
				data: {
					create_board: {
						id: "789",
					},
				},
			};

			mockMondayProApiRequest.mockResolvedValueOnce(mockResponse);

			const result = await boardCreateExecute.call(
				mockExecuteFunctions as any,
				0,
			);

			expect(result).toEqual({ id: "789" });
		});

		it("should create a board with multiple additional fields", async () => {
			const mockExecuteFunctions = new ExecuteFunctionsMock({
				name: "My Board",
				additionalFields: {
					description: "Board description",
					empty: true,
					boardKind: "private",
					folderId: 456,
					workspaceId: 789,
				},
			});

			const mockResponse = {
				data: {
					create_board: {
						id: "111",
					},
				},
			};

			mockMondayProApiRequest.mockResolvedValueOnce(mockResponse);

			const result = await boardCreateExecute.call(
				mockExecuteFunctions as any,
				0,
			);

			expect(result).toEqual({ id: "111" });
		});

		it("should create a board with board kind public", async () => {
			const mockExecuteFunctions = new ExecuteFunctionsMock({
				name: "Public Board",
				additionalFields: {
					boardKind: "public",
				},
			});

			const mockResponse = {
				data: {
					create_board: {
						id: "222",
					},
				},
			};

			mockMondayProApiRequest.mockResolvedValueOnce(mockResponse);

			const result = await boardCreateExecute.call(
				mockExecuteFunctions as any,
				0,
			);

			expect(result).toEqual({ id: "222" });
		});

		it("should create a board with owner IDs", async () => {
			const mockExecuteFunctions = new ExecuteFunctionsMock({
				name: "Team Board",
				additionalFields: {
					boardOwnerIds: "123, 456, 789",
				},
			});

			const mockResponse = {
				data: {
					create_board: {
						id: "333",
					},
				},
			};

			mockMondayProApiRequest.mockResolvedValueOnce(mockResponse);

			const result = await boardCreateExecute.call(
				mockExecuteFunctions as any,
				0,
			);

			expect(result).toEqual({ id: "333" });
		});

		it("should create a board with item nickname", async () => {
			const mockExecuteFunctions = new ExecuteFunctionsMock({
				name: "Tasks Board",
				additionalFields: {
					itemNickname: {
						singular: "Task",
						plural: "Tasks",
						presetType: "task",
					},
				},
			});

			const mockResponse = {
				data: {
					create_board: {
						id: "444",
					},
				},
			};

			mockMondayProApiRequest.mockResolvedValueOnce(mockResponse);

			const result = await boardCreateExecute.call(
				mockExecuteFunctions as any,
				0,
			);

			expect(result).toEqual({ id: "444" });
		});

		it("should create a board with template ID", async () => {
			const mockExecuteFunctions = new ExecuteFunctionsMock({
				name: "Templated Board",
				additionalFields: {
					templateId: 12345,
				},
			});

			const mockResponse = {
				data: {
					create_board: {
						id: "555",
					},
				},
			};

			mockMondayProApiRequest.mockResolvedValueOnce(mockResponse);

			const result = await boardCreateExecute.call(
				mockExecuteFunctions as any,
				0,
			);

			expect(result).toEqual({ id: "555" });
		});

		it("should create a board with subscriber IDs", async () => {
			const mockExecuteFunctions = new ExecuteFunctionsMock({
				name: "Board",
				additionalFields: {
					boardSubscriberIds: "111, 222",
				},
			});

			const mockResponse = {
				data: {
					create_board: {
						id: "666",
					},
				},
			};

			mockMondayProApiRequest.mockResolvedValueOnce(mockResponse);

			const result = await boardCreateExecute.call(
				mockExecuteFunctions as any,
				0,
			);

			expect(result).toEqual({ id: "666" });
		});
	});

	describe("error scenarios", () => {
		it("should throw error when no response from API", async () => {
			const mockExecuteFunctions = new ExecuteFunctionsMock({
				name: "My Board",
				additionalFields: {},
			});

			mockMondayProApiRequest.mockResolvedValueOnce(null);

			await expect(
				boardCreateExecute.call(mockExecuteFunctions as any, 0),
			).rejects.toThrow("No response from API");
		});

		it("should throw error when API returns GraphQL errors", async () => {
			const mockExecuteFunctions = new ExecuteFunctionsMock({
				name: "My Board",
				additionalFields: {},
			});

			const mockResponse = {
				errors: [
					{
						message: "Board name already exists",
					},
					{
						message: "Invalid workspace",
					},
				],
			};

			mockMondayProApiRequest.mockResolvedValueOnce(mockResponse);

			await expect(
				boardCreateExecute.call(mockExecuteFunctions as any, 0),
			).rejects.toThrow(
				"GraphQL Error: Board name already exists, Invalid workspace",
			);
		});

		it("should throw error when response data is missing", async () => {
			const mockExecuteFunctions = new ExecuteFunctionsMock({
				name: "My Board",
				additionalFields: {},
			});

			mockMondayProApiRequest.mockResolvedValueOnce({});

			await expect(
				boardCreateExecute.call(mockExecuteFunctions as any, 0),
			).rejects.toThrow("Invalid API response structure");
		});

		it("should throw error when create_board is missing from response", async () => {
			const mockExecuteFunctions = new ExecuteFunctionsMock({
				name: "My Board",
				additionalFields: {},
			});

			mockMondayProApiRequest.mockResolvedValueOnce({ data: {} });

			await expect(
				boardCreateExecute.call(mockExecuteFunctions as any, 0),
			).rejects.toThrow("Board creation failed");
		});

		it("should throw error when API request fails", async () => {
			const mockExecuteFunctions = new ExecuteFunctionsMock({
				name: "My Board",
				additionalFields: {},
			});

			const error = new Error("Network error");
			mockMondayProApiRequest.mockRejectedValueOnce(error);

			await expect(
				boardCreateExecute.call(mockExecuteFunctions as any, 0),
			).rejects.toThrow("Network error");
		});

		it("should throw error when create_board returns null", async () => {
			const mockExecuteFunctions = new ExecuteFunctionsMock({
				name: "My Board",
				additionalFields: {},
			});

			mockMondayProApiRequest.mockResolvedValueOnce({
				data: {
					create_board: null,
				},
			});

			await expect(
				boardCreateExecute.call(mockExecuteFunctions as any, 0),
			).rejects.toThrow("Board creation failed");
		});
	});
});
