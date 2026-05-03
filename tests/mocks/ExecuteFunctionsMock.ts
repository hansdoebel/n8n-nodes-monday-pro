interface ExecuteFunctionsMockOptions {
	inputData?: Array<{ json: any }>;
	continueOnFail?: boolean;
}

export class ExecuteFunctionsMock {
	private nodeParameters: Record<string, any> = {};
	private _helpers: any;
	private _inputData: Array<{ json: any }>;
	private _continueOnFail: boolean;

	constructor(
		nodeParameters: Record<string, any> = {},
		helpers?: Record<string, any>,
		options: ExecuteFunctionsMockOptions = {},
	) {
		this.nodeParameters = nodeParameters;
		this._helpers = helpers || {
			httpRequestWithAuthentication: jest.fn(),
		};
		this._inputData = options.inputData ?? [{ json: {} }];
		this._continueOnFail = options.continueOnFail ?? false;
	}

	getNodeParameter(
		parameterName: string,
		itemIndex: number,
		fallbackValue?: any,
	): any {
		const value = this.nodeParameters[parameterName];
		if (value === undefined) return fallbackValue;
		if (typeof value === "function") return value(itemIndex);
		return value;
	}

	getNode() {
		return {
			name: "Test Node",
			type: "n8n-nodes-monday-pro.mondayPro",
			typeVersion: 1,
			position: [0, 0],
		};
	}

	getInputData() {
		return this._inputData;
	}

	continueOnFail() {
		return this._continueOnFail;
	}

	setMockHelper(name: string, implementation: any) {
		this._helpers[name] = implementation;
	}

	get helpers() {
		return this._helpers;
	}

	set helpers(value: any) {
		this._helpers = value;
	}
}
