import {filter, head, isArray, tail} from "@softwareventures/array";
import chain from "@softwareventures/chain";
import {failure, mapFailure, mapFailureFn, mapResultFn, Result, success} from "../result/result";
import {insert as mapInsert} from "../collections/maps";
import {Directory, emptyDirectory} from "./directory";
import {File} from "./file";
import {ReadFileNodeResult} from "./read-file-node-result";
import {InsertFailureReason} from "./insert-failure-reason";

export type FileNode = Directory | File;

export function pathSegments(path: string | readonly string[]): readonly string[] {
    return isArray(path) ? path : path.split("/");
}

export function readFileNode(root: FileNode, path: string | readonly string[]): ReadFileNodeResult {
    return readFileNodeInternal(root, pathSegments(path));
}

function readFileNodeInternal(root: FileNode, path: readonly string[]): ReadFileNodeResult {
    const entryName = head(path);
    const rest = tail(path);

    if (entryName == null) {
        return success(root);
    } else if (rest.length === 0) {
        return success(root);
    } else if (root.type !== "directory") {
        return failure([{type: "not-a-directory", path: entryName}]);
    }

    const entry = root.entries.get(entryName);

    if (entry == null) {
        return failure([{type: "file-not-found", path: entryName}]);
    } else {
        return mapFailure(readFileNodeInternal(entry, rest), reason => ({
            ...reason,
            path: `${entryName}/${reason.path}`
        }));
    }
}

export type InsertResult = Result<InsertFailureReason, Directory>;

export function insert(
    root: FileNode,
    path: string | readonly string[],
    node: FileNode
): InsertResult {
    if (root.type !== "directory") {
        return failure([{type: "not-a-directory", path: ""}]);
    }

    return insertInternal(
        root,
        filter(pathSegments(path), segment => segment !== ""),
        node
    );
}

export function insertSubdirectory(root: FileNode, path: string | readonly string[]): InsertResult {
    return insert(root, path, emptyDirectory);
}

function insertInternal(root: Directory, path: readonly string[], file: FileNode): InsertResult {
    const entryName = head(path);

    if (entryName == null) {
        if (file.type === "directory") {
            return success(root);
        } else {
            return failure([{type: "file-exists", path: ""}]);
        }
    }

    const defaultEntry = path.length > 1 ? emptyDirectory : undefined;
    const existingEntry = root.entries.get(entryName) ?? defaultEntry;

    if (existingEntry == null) {
        return success({...root, entries: mapInsert(root.entries, entryName, file)});
    } else if (path.length === 1 && file.type !== "directory") {
        return failure([{type: "file-exists", path: entryName}]);
    } else if (existingEntry.type !== "directory") {
        return failure([{type: "not-a-directory", path: entryName}]);
    } else {
        return chain(insertInternal(existingEntry, tail(path), file))
            .map(mapFailureFn(reason => ({...reason, path: `${entryName}/${reason.path}`})))
            .map(
                mapResultFn(newEntry => ({
                    ...root,
                    entries: mapInsert(root.entries, entryName, newEntry)
                }))
            ).value;
    }
}
