import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockMondayProApiRequest = mock();

mock.module("@utils/GenericFunctions", () => ({
	mondayProApiRequest: mockMondayProApiRequest,
}));

import { boardItemChangeColumnValueBatchedExecute } from "../../nodes/MondayPro/resources/boardItem/operations/BoardItemChangeColumnValueBatched";
import { ExecuteFunctionsMock } from "../mocks/ExecuteFunctionsMock";

const STATUS_VALUE = JSON.stringify({ label: "Done" });

function buildPerRowParams(rows: Array<{ board: string; item: string }>) {
	return {
		boardId: (i: number) => rows[i]?.board,
		itemId: (i: number) => rows[i]?.item,
		columnId: "status",
		value: STATUS_VALUE,
		additionalFields: {},
	};
}

describe("boardItemChangeColumnValueBatchedExecute", () => {
	beforeEach(() => {
		mockMondayProApiRequest.mockClear();
	});

	it("is marked as a batched execute function", () => {
		expect(
			(boardItemChangeColumnValueBatchedExecute as unknown as { batch: boolean })
				.batch,
		).toBe(true);
	});

	it("returns no rows and makes no API call for empty input", async () => {
		const fns = new ExecuteFunctionsMock(buildPerRowParams([]), undefined, {
			inputData: [],
		});

		const result = await boardItemChangeColumnValueBatchedExecute.call(
			fns as any,
			[],
		);

		expect(mockMondayProApiRequest).not.toHaveBeenCalled();
		expect(result).toEqual([]);
	});

	it("sends a single aliased mutation for N rows and pairs results back", async () => {
		const rows = [
			{ board: "B1", item: "I1" },
			{ board: "B1", item: "I2" },
			{ board: "B2", item: "I3" },
		];
		const fns = new ExecuteFunctionsMock(buildPerRowParams(rows), undefined, {
			inputData: rows.map((_, i) => ({ json: { row: i } })),
		});

		mockMondayProApiRequest.mockResolvedValueOnce({
			data: { m0: { id: "I1" }, m1: { id: "I2" }, m2: { id: "I3" } },
		});

		const result = await boardItemChangeColumnValueBatchedExecute.call(
			fns as any,
			(fns as any).getInputData(),
		);

		expect(mockMondayProApiRequest).toHaveBeenCalledTimes(1);

		const [body] = mockMondayProApiRequest.mock.calls[0] as [
			{ query: string; variables: Record<string, unknown> },
		];
		expect(body.query).toContain("m0: change_column_value");
		expect(body.query).toContain("m1: change_column_value");
		expect(body.query).toContain("m2: change_column_value");
		expect(body.variables).toMatchObject({
			bid0: "B1",
			iid0: "I1",
			cid0: "status",
			v0: STATUS_VALUE,
			bid2: "B2",
			iid2: "I3",
		});

		expect(result).toEqual([
			{ json: { id: "I1" }, pairedItem: { item: 0 } },
			{ json: { id: "I2" }, pairedItem: { item: 1 } },
			{ json: { id: "I3" }, pairedItem: { item: 2 } },
		]);
	});

	it("chunks requests by chunkSize", async () => {
		const rows = [
			{ board: "B", item: "I1" },
			{ board: "B", item: "I2" },
			{ board: "B", item: "I3" },
			{ board: "B", item: "I4" },
			{ board: "B", item: "I5" },
		];
		const params = buildPerRowParams(rows);
		params.additionalFields = { chunkSize: 2 } as any;
		const fns = new ExecuteFunctionsMock(params, undefined, {
			inputData: rows.map((_, i) => ({ json: { row: i } })),
		});

		mockMondayProApiRequest.mockResolvedValueOnce({
			data: { m0: { id: "I1" }, m1: { id: "I2" } },
		});
		mockMondayProApiRequest.mockResolvedValueOnce({
			data: { m0: { id: "I3" }, m1: { id: "I4" } },
		});
		mockMondayProApiRequest.mockResolvedValueOnce({
			data: { m0: { id: "I5" } },
		});

		const result = await boardItemChangeColumnValueBatchedExecute.call(
			fns as any,
			(fns as any).getInputData(),
		);

		expect(mockMondayProApiRequest).toHaveBeenCalledTimes(3);
		expect(result.map((r: any) => r.json.id)).toEqual([
			"I1",
			"I2",
			"I3",
			"I4",
			"I5",
		]);
		expect(result.map((r: any) => r.pairedItem.item)).toEqual([0, 1, 2, 3, 4]);
	});

	it("emits per-row error rows for per-alias errors when continueOnFail is on", async () => {
		const rows = [
			{ board: "B", item: "I1" },
			{ board: "B", item: "I2" },
			{ board: "B", item: "I3" },
		];
		const fns = new ExecuteFunctionsMock(buildPerRowParams(rows), undefined, {
			inputData: rows.map((_, i) => ({ json: { row: i } })),
			continueOnFail: true,
		});

		mockMondayProApiRequest.mockResolvedValueOnce({
			data: { m0: { id: "I1" }, m1: null, m2: { id: "I3" } },
			errors: [{ message: "Item not found", path: ["m1"] }],
		});

		const result = await boardItemChangeColumnValueBatchedExecute.call(
			fns as any,
			(fns as any).getInputData(),
		);

		expect(result).toEqual([
			{ json: { id: "I1" }, pairedItem: { item: 0 } },
			{ json: { error: "Item not found" }, pairedItem: { item: 1 } },
			{ json: { id: "I3" }, pairedItem: { item: 2 } },
		]);
	});

	it("throws on per-alias errors when continueOnFail is off", async () => {
		const rows = [
			{ board: "B", item: "I1" },
			{ board: "B", item: "I2" },
			{ board: "B", item: "I3" },
		];
		const fns = new ExecuteFunctionsMock(buildPerRowParams(rows), undefined, {
			inputData: rows.map((_, i) => ({ json: { row: i } })),
		});

		mockMondayProApiRequest.mockResolvedValueOnce({
			data: { m0: { id: "I1" }, m1: null, m2: { id: "I3" } },
			errors: [{ message: "Item not found", path: ["m1"] }],
		});

		await expect(
			boardItemChangeColumnValueBatchedExecute.call(
				fns as any,
				(fns as any).getInputData(),
			),
		).rejects.toThrow(/Item not found/);
	});

	it("emits an error row for an invalid JSON value when continueOnFail is on", async () => {
		const rows = [
			{ board: "B", item: "I1" },
			{ board: "B", item: "I2" },
		];
		const fns = new ExecuteFunctionsMock(
			{
				boardId: (i: number) => rows[i].board,
				itemId: (i: number) => rows[i].item,
				columnId: "status",
				value: (i: number) => (i === 1 ? "{not-json" : STATUS_VALUE),
				additionalFields: {},
			},
			undefined,
			{
				inputData: rows.map((_, i) => ({ json: { row: i } })),
				continueOnFail: true,
			},
		);

		mockMondayProApiRequest.mockResolvedValueOnce({
			data: { m0: { id: "I1" } },
		});

		const result = await boardItemChangeColumnValueBatchedExecute.call(
			fns as any,
			(fns as any).getInputData(),
		);

		expect(mockMondayProApiRequest).toHaveBeenCalledTimes(1);
		const [body] = mockMondayProApiRequest.mock.calls[0] as [
			{ variables: Record<string, unknown> },
		];
		expect(Object.keys(body.variables)).toEqual(["bid0", "iid0", "cid0", "v0"]);

		expect(result).toEqual([
			{ json: { id: "I1" }, pairedItem: { item: 0 } },
			{
				json: { error: expect.stringContaining("Value must be valid JSON") },
				pairedItem: { item: 1 },
			},
		]);
	});

	it("propagates HTTP failures across an entire chunk when continueOnFail is on", async () => {
		const rows = [
			{ board: "B", item: "I1" },
			{ board: "B", item: "I2" },
		];
		const fns = new ExecuteFunctionsMock(buildPerRowParams(rows), undefined, {
			inputData: rows.map((_, i) => ({ json: { row: i } })),
			continueOnFail: true,
		});

		mockMondayProApiRequest.mockRejectedValueOnce(new Error("Network error"));

		const result = await boardItemChangeColumnValueBatchedExecute.call(
			fns as any,
			(fns as any).getInputData(),
		);

		expect(result).toEqual([
			{ json: { error: "Network error" }, pairedItem: { item: 0 } },
			{ json: { error: "Network error" }, pairedItem: { item: 1 } },
		]);
	});
});
