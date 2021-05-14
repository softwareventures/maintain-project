import {InternalFileNode} from "./file-node";

export interface Directory {
    readonly type: "fs-changeset-directory";
    readonly path: string;
}

export interface InternalDirectory extends Directory {
    readonly fullPath: string;
    readonly underlyingMTime: bigint | null;
    readonly entries: ReadonlyMap<string, InternalFileNode>;
}
