export class ExecuteFunctionsMock {
	private nodeParameters: Record<string, any> = {};
	private _helpers: any;

	constructor(
		nodeParameters: Record<string, any> = {},
		helpers?: Record<string, any>,
	) {
		this.nodeParameters = nodeParameters;
		this._helpers = helpers || {
			requestWithAuthentication: jest.fn(),
		};
	}

	getNodeParameter(
		parameterName: string,
		itemIndex: number,
		fallbackValue?: any,
	): any {
		const value = this.nodeParameters[parameterName];
		return value !== undefined ? value : fallbackValue;
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
		return [{ json: {} }];
	}

	continueOnFail() {
		return false;
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
