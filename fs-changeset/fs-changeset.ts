import {resolve} from "path";
import {InternalFileNode} from "./internal-file-node";

export interface FsChangeset {
    readonly path: string;
    readonly root?: InternalFileNode;
}

export function openFsChangeset(path: string): FsChangeset {
    return {path: resolve(path)};
}
