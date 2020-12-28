import chain from "@softwareventures/chain";
import {mapResultFn, Result} from "../result/result";
import {Directory, insert as insertIntoDirectory} from "./directory";
import {FileExists} from "./file-exists";
import {FileNode} from "./file-node";

export interface FsChangeset {
    readonly root: Directory;
    readonly overwrite?: boolean;
}

export type InsertResult = Result<FileExists, FsChangeset>;

export function insert(
    fsChangeset: FsChangeset,
    path: string | readonly string[],
    node: FileNode
): InsertResult {
    return chain(insertIntoDirectory(fsChangeset.root, path, node)).map(
        mapResultFn(root => ({...fsChangeset, root}))
    ).value;
}

export function insertFn(
    path: string | readonly string[],
    node: FileNode
): (fsChangeset: FsChangeset) => InsertResult {
    return fsChangeset => insert(fsChangeset, path, node);
}
