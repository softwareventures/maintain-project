import {chain} from "@softwareventures/chain";
import type {Result} from "../result/result.js";
import {mapResultFn} from "../result/result.js";
import type {Directory} from "./directory.js";
import type {FileNode} from "./file-node.js";
import {
    insert as insertIntoDirectory,
    insertSubdirectory as insertSubdirectoryIntoDirectory
} from "./file-node.js";
import type {InsertFailureReason} from "./insert-failure-reason.js";

export interface FsStage {
    readonly root: Directory;
    readonly overwrite?: boolean | undefined;
}

export type InsertResult = Result<InsertFailureReason, FsStage>;

export function insert(stage: FsStage, path: string, node: FileNode): InsertResult {
    return chain(insertIntoDirectory(stage.root, path, node)).map(
        mapResultFn(root => ({...stage, root}))
    ).value;
}

export function insertFn(path: string, node: FileNode): (fsStage: FsStage) => InsertResult {
    return fsStage => insert(fsStage, path, node);
}

export function insertSubdirectory(fsStage: FsStage, path: string): InsertResult {
    return chain(insertSubdirectoryIntoDirectory(fsStage.root, path)).map(
        mapResultFn(root => ({...fsStage, root}))
    ).value;
}

export function insertSubdirectoryFn(path: string): (fsStage: FsStage) => InsertResult {
    return fsStage => insertSubdirectory(fsStage, path);
}
