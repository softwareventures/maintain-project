import chain from "@softwareventures/chain";
import {mapResultFn, Result} from "../result/result";
import {
    Directory,
    insert as insertIntoDirectory,
    insertSubdirectory as insertSubdirectoryIntoDirectory
} from "./directory";
import {FileNode} from "./file-node";
import {InsertFailureReason} from "./insert-failure-reason";

export interface FsChangeset {
    readonly root: Directory;
    readonly overwrite?: boolean;
}

export type InsertResult = Result<InsertFailureReason, FsChangeset>;

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

export function insertSubdirectory(
    fsChangeset: FsChangeset,
    path: string | readonly string[]
): InsertResult {
    return chain(insertSubdirectoryIntoDirectory(fsChangeset.root, path)).map(
        mapResultFn(root => ({...fsChangeset, root}))
    ).value;
}

export function insertSubdirectoryFn(
    path: string | readonly string[]
): (fsChangeset: FsChangeset) => InsertResult {
    return fsChangeset => insertSubdirectory(fsChangeset, path);
}
