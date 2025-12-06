// nodes/MondayPro/types.ts
import type { IDataObject } from "n8n-workflow";

export interface IGraphqlBody extends IDataObject {
	query: string;
	variables: IDataObject;
}
