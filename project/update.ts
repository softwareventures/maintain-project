import {FsStage, InsertResult} from "../fs-stage/fs-stage";

export interface Update {
    readonly log: string;
    readonly apply: (stage: FsStage) => Promise<InsertResult>;
}
