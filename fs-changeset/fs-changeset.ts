import {resolve} from "path";
import {FileNode} from "../fs-stage/file-node";

export interface FsChangeset {
    readonly path: string;
    readonly changeRoot?: FileNode;
}

export function openFsChangeset(path: string): FsChangeset {
    return {path: resolve(path)};
}
