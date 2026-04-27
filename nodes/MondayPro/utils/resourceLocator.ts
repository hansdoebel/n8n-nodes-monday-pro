import type {
	INodeParameterResourceLocator,
	INodeProperties,
	INodePropertyMode,
} from "n8n-workflow";

export function extractResourceLocatorValue(
	value: unknown,
): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "object") {
		const v = (value as INodeParameterResourceLocator).value;
		return v === null || v === undefined ? "" : String(v);
	}
	return String(value);
}

type IdValidation = NonNullable<INodePropertyMode["validation"]>;

const NUMERIC_ID_VALIDATION: IdValidation = [
	{
		type: "regex",
		properties: {
			regex: "^[0-9]+$",
			errorMessage: "ID must be numeric",
		},
	},
];

function buildResourceLocatorModes(
	searchListMethod: string,
	idPlaceholder: string,
	validation: IdValidation | undefined = NUMERIC_ID_VALIDATION,
): INodePropertyMode[] {
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	const idMode: INodePropertyMode = {
		displayName: "By ID",
		name: "id",
		type: "string",
		placeholder: idPlaceholder,
	};
	if (validation) idMode.validation = validation;

	return [
		// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
		{
			displayName: "From List",
			name: "list",
			type: "list",
			typeOptions: {
				searchListMethod,
				searchable: true,
				searchFilterRequired: false,
			},
		},
		idMode,
	];
}

interface ResourceLocatorFieldOptions {
	displayName: string;
	name: string;
	required?: boolean;
	description?: string;
	hint?: string;
	displayOptions?: INodeProperties["displayOptions"];
}

function makeResourceLocator(
	searchListMethod: string,
	idPlaceholder: string,
	options: ResourceLocatorFieldOptions,
	validation: IdValidation | undefined = NUMERIC_ID_VALIDATION,
): INodeProperties {
	const field: INodeProperties = {
		displayName: options.displayName,
		name: options.name,
		type: "resourceLocator",
		default: { mode: "list", value: "" },
		required: options.required ?? false,
		modes: buildResourceLocatorModes(searchListMethod, idPlaceholder, validation),
	};
	if (options.description) field.description = options.description;
	if (options.hint) field.hint = options.hint;
	if (options.displayOptions) field.displayOptions = options.displayOptions;
	return field;
}

export function boardResourceLocator(
	options: ResourceLocatorFieldOptions,
): INodeProperties {
	return makeResourceLocator("searchBoards", "e.g. 1234567890", options);
}

export function workspaceResourceLocator(
	options: ResourceLocatorFieldOptions,
): INodeProperties {
	return makeResourceLocator("searchWorkspaces", "e.g. 1234567", options);
}

export function folderResourceLocator(
	options: ResourceLocatorFieldOptions,
): INodeProperties {
	return makeResourceLocator("searchFolders", "e.g. 12345678", options);
}

export function itemResourceLocator(
	options: ResourceLocatorFieldOptions,
): INodeProperties {
	return makeResourceLocator("searchItems", "e.g. 1234567890", {
		hint: "Showing the 100 most recently created items. Switch to \"By ID\" for older items.",
		...options,
	});
}

export function groupResourceLocator(
	options: ResourceLocatorFieldOptions,
): INodeProperties {
	return makeResourceLocator(
		"searchGroups",
		"e.g. topics",
		options,
		undefined,
	);
}

export function columnResourceLocator(
	options: ResourceLocatorFieldOptions,
): INodeProperties {
	return makeResourceLocator(
		"searchColumns",
		"e.g. status_1",
		options,
		undefined,
	);
}

export function docResourceLocator(
	options: ResourceLocatorFieldOptions,
): INodeProperties {
	return makeResourceLocator("searchDocs", "e.g. 123456789", options);
}
