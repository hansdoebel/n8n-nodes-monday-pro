import type { IDataObject } from "n8n-workflow";

export interface IGraphqlBody extends IDataObject {
	query: string;
	variables: IDataObject;
}

export interface IApiResponse extends IDataObject {
	data?: IDataObject;
	errors?: Array<{
		message: string;
		extensions?: IDataObject;
	}>;
}

export interface IPaginationCursor extends IDataObject {
	cursor: string | null;
	hasMore: boolean;
}

export interface IColumnValue extends IDataObject {
	columnId: string;
	value: string | number | boolean | Record<string, any>;
}

export interface IBoardCreateRequest extends IDataObject {
	name: string;
	boardKind: string;
	description?: string;
	empty?: boolean;
	folderId?: number;
	templateId?: number;
	workspaceId?: number;
	boardOwnerIds?: string[];
	boardOwnerTeamIds?: string[];
	boardSubscriberIds?: string[];
	boardSubscriberTeamIds?: string[];
	itemNickname?: {
		singular?: string;
		plural?: string;
		presetType?: string;
	};
}

export interface IItemCreateRequest extends IDataObject {
	boardId: string | number;
	groupId: string;
	itemName: string;
	columnValues?: Record<string, any>;
}

export interface ILoadOptionsResponse extends IDataObject {
	name: string;
	value: string | number;
}

export {
	API_CONFIG,
	API_HEADERS,
	AuthenticationMethod,
	BoardColumnOperations,
	BoardGroupOperations,
	BoardItemOperations,
	BoardKind,
	BoardOperations,
	BoardSubitemOperations,
	BoardWebhookOperations,
	ColumnValueMode,
	CREDENTIAL_TYPES,
	DISPLAY_NAMES,
	DocsOperations,
	ERROR_MESSAGES,
	FolderOperations,
	GRAPHQL_FIELDS,
	GRAPHQL_MUTATION_NAMES,
	GRAPHQL_QUERY_NAMES,
	LOAD_OPTIONS_METHODS,
	NODE_PARAMETER_NAMES,
	NodeResources,
	OPERATION_EXECUTION_SUFFIX,
	PAGINATION_CONFIG,
} from "@utils/Constants";
