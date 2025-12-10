export enum NodeResources {
	BOARD = "board",
	BOARD_COLUMN = "boardColumn",
	BOARD_GROUP = "boardGroup",
	BOARD_ITEM = "boardItem",
	BOARD_SUBITEM = "boardSubitem",
	BOARD_WEBHOOK = "boardWebhook",
	DOCS = "docs",
	FOLDER = "folder",
}

export enum BoardOperations {
	ARCHIVE = "archive",
	CREATE = "create",
	DELETE = "delete",
	DUPLICATE = "duplicate",
	GET = "get",
	GET_ALL = "getAll",
	SET_PERMISSION = "setPermission",
	UPDATE = "update",
	UPDATE_HIERARCHY = "updateHierarchy",
}

export enum BoardColumnOperations {
	CREATE = "create",
	GET_ALL = "getAll",
}

export enum BoardGroupOperations {
	CREATE = "create",
	DELETE = "delete",
	GET_ALL = "getAll",
}

export enum BoardItemOperations {
	ADD_UPDATE = "addUpdate",
	CHANGE_COLUMN_VALUE = "changeColumnValue",
	CHANGE_MULTIPLE_COLUMN_VALUES = "changeMultipleColumnValues",
	CREATE = "create",
	DELETE = "delete",
	GET = "get",
	GET_ALL = "getAll",
	GET_BY_COLUMN_VALUE = "getByColumnValue",
	GET_FILTERED = "getFiltered",
	MOVE = "move",
}

export enum BoardSubitemOperations {
	CREATE = "create",
}

export enum BoardWebhookOperations {
	CREATE = "create",
	DELETE = "delete",
	GET_ALL = "getAll",
}

export enum DocsOperations {
	CREATE = "create",
	GET_ALL = "getAll",
}

export enum FolderOperations {
	CREATE = "create",
	GET_ALL = "getAll",
}

export enum AuthenticationMethod {
	ACCESS_TOKEN = "accessToken",
	OAUTH2 = "oAuth2",
}

export enum BoardKind {
	PRIVATE = "private",
	PUBLIC = "public",
	SHARE = "share",
}

export enum ColumnValueMode {
	SIMPLE = "simple",
	ADVANCED = "advanced",
}

export const API_CONFIG = {
	BASE_URL: "https://api.monday.com/v2/",
	VERSION: "2025-10",
	METHOD: "POST",
	CONTENT_TYPE: "application/json",
} as const;

export const API_HEADERS = {
	"API-Version": API_CONFIG.VERSION,
	"Content-Type": API_CONFIG.CONTENT_TYPE,
} as const;

export const PAGINATION_CONFIG = {
	DEFAULT_LIMIT: 50,
	MAX_LIMIT: 100,
	INITIAL_PAGE: 1,
} as const;

export const NODE_PARAMETER_NAMES = {
	RESOURCE: "resource",
	OPERATION: "operation",
	AUTHENTICATION: "authentication",
	BOARD_ID: "boardId",
	GROUP_ID: "groupId",
	ITEM_ID: "itemId",
	COLUMN_ID: "columnId",
	SUBITEM_ID: "subitemId",
	WEBHOOK_ID: "webhookId",
	FOLDER_ID: "folderId",
	NAME: "name",
	ADDITIONAL_FIELDS: "additionalFields",
} as const;

export const GRAPHQL_FIELDS = {
	ID: "id",
	NAME: "name",
	DESCRIPTION: "description",
	CREATED_AT: "created_at",
	UPDATED_AT: "updated_at",
	STATE: "state",
	OWNER: "owner",
	PERMISSIONS: "permissions",
} as const;

export const ERROR_MESSAGES = {
	NO_RESPONSE: "No response from API",
	INVALID_RESPONSE: "Invalid API response structure",
	OPERATION_FAILED: "Operation failed",
	GRAPHQL_ERROR: "GraphQL Error",
	UNSUPPORTED_OPERATION: "Unsupported operation",
	MISSING_PARAMETER: "Missing required parameter",
	INVALID_PARAMETER: "Invalid parameter value",
} as const;

export const OPERATION_EXECUTION_SUFFIX = "Execute" as const;

export const GRAPHQL_MUTATION_NAMES = {
	CREATE_BOARD: "create_board",
	CREATE_ITEM: "create_item",
	CREATE_SUBITEM: "create_subitem",
	CREATE_COLUMN: "create_column",
	CREATE_GROUP: "create_group",
	UPDATE_BOARD: "update_board",
	UPDATE_ITEM: "update_item",
	DELETE_BOARD: "delete_board",
	DELETE_ITEM: "delete_item",
	DELETE_GROUP: "delete_group",
	DUPLICATE_BOARD: "duplicate_board",
	ARCHIVE_BOARD: "archive_board",
	CHANGE_COLUMN_VALUE: "change_column_value",
	CREATE_WEBHOOK: "create_webhook",
	DELETE_WEBHOOK: "delete_webhook",
} as const;

export const GRAPHQL_QUERY_NAMES = {
	BOARDS: "boards",
	ITEMS: "items",
	GROUPS: "groups",
	COLUMNS: "columns",
	USERS: "users",
	TEAMS: "teams",
	WORKSPACES: "workspaces",
	WEBHOOKS: "webhooks",
	ME: "me",
	ACCOUNT: "account",
} as const;

export const CREDENTIAL_TYPES = {
	ACCESS_TOKEN: "mondayProApi",
	OAUTH2: "mondayProOAuth2Api",
} as const;

export const DISPLAY_NAMES = {
	OPERATION: "Operation",
	RESOURCE: "Resource",
	AUTHENTICATION: "Authentication",
	ADDITIONAL_FIELDS: "Additional Fields",
	BOARD_NAME_OR_ID: "Board Name or ID",
	GROUP_NAME_OR_ID: "Group Name or ID",
	ITEM_NAME_OR_ID: "Item Name or ID",
	COLUMN_NAME_OR_ID: "Column Name or ID",
} as const;

export const LOAD_OPTIONS_METHODS = {
	GET_BOARDS: "getBoards",
	GET_GROUPS: "getGroups",
	GET_COLUMNS: "getColumns",
	GET_USERS: "getUsers",
	GET_TEAMS: "getTeams",
	GET_WORKSPACES: "getWorkspaces",
	GET_ITEMS: "getItems",
} as const;
