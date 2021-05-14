import {InternalFileNode} from "./internal-file-node";

export interface InternalDirectory {
    readonly type: "fs-changeset-internal-directory";
    readonly path: string;
    readonly underlyingMTime: bigint | null;
    readonly entries: ReadonlyMap<string, InternalFileNode>;
}

export interface InternalDirectoryOptions {
    readonly path: string;
    readonly underlyingMTime: bigint;
}

export function internalDirectory({
    path,
    underlyingMTime
}: InternalDirectoryOptions): InternalDirectory {
    return {
        type: "fs-changeset-internal-directory",
        path,
        underlyingMTime,
        entries: new Map<string, InternalFileNode>()
    };
}
