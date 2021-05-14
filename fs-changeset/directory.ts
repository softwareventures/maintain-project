import {InternalFileNode} from "./file-node";
import {FsChangeset} from "./fs-changeset";

export interface Directory {
    readonly type: "fs-changeset-directory";
    readonly fsChangeset: FsChangeset;
    readonly path: string;
}

export interface InternalDirectory {
    readonly type: "fs-changeset-internal-directory";
    readonly underlyingMTime: bigint | null;
    readonly entries: ReadonlyMap<string, InternalFileNode>;
}
