import chain from "@softwareventures/chain";
import {mapResultFn, Result} from "../result/result";
import {Directory} from "./directory";
import {
    FileNode,
    insert as insertIntoDirectory,
    insertSubdirectory as insertSubdirectoryIntoDirectory
} from "./file-node";
import {InsertFailureReason} from "./insert-failure-reason";

export interface FsStage {
    readonly root: Directory;
    readonly overwrite?: boolean;
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
