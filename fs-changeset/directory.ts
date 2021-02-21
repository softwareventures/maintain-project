import {filter, head, isArray, tail} from "@softwareventures/array";
import chain from "@softwareventures/chain";
import {insert as mapInsert} from "../collections/maps";
import {failure, mapFailure, mapFailureFn, mapResultFn, Result, success} from "../result/result";
import {FileExists} from "./file-exists";
import {FileNode} from "./file-node";
import {ReadFileNodeResult} from "./read-file-node-result";

export interface Directory {
    readonly type: "directory";
    readonly entries: ReadonlyMap<string, FileNode>;
}

export const emptyDirectory: Directory = {type: "directory", entries: new Map()};

export type InsertResult = Result<InsertFailureReason, Directory>;

export type InsertFailureReason = FileExists;

export function insert(
    root: Directory,
    path: string | readonly string[],
    node: FileNode
): InsertResult {
    return insertInternal(
        root,
        filter(pathSegments(path), segment => segment !== ""),
        node
    );
}

export function insertSubdirectory(
    root: Directory,
    path: string | readonly string[]
): InsertResult {
    return insert(root, path, emptyDirectory);
}

function pathSegments(path: string | readonly string[]): readonly string[] {
    return isArray(path) ? path : path.split("/");
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
    } else if (existingEntry.type !== "directory") {
        return failure([{type: "file-exists", path: entryName}]);
    } else {
        return chain(insertInternal(existingEntry, tail(path), file))
            .map(
                mapFailureFn(reason =>
                    reason.type === "file-exists"
                        ? {...reason, path: `${entryName}/${reason.path}`}
                        : reason
                )
            )
            .map(
                mapResultFn(newEntry => ({
                    ...root,
                    entries: mapInsert(root.entries, entryName, newEntry)
                }))
            ).value;
    }
}

export interface ListOptions {
    readonly directory: Directory;
    readonly recursive?: boolean;
}

export interface Entry {
    readonly path: string;
    readonly file: FileNode;
}

export function list(options: ListOptions): IterableIterator<Entry> {
    return listInternal("", options);
}

function* listInternal(pathPrefix: string, options: ListOptions): IterableIterator<Entry> {
    for (const [path, file] of options.directory.entries) {
        yield {path: pathPrefix + path, file};
        if (options.recursive && file.type === "directory") {
            yield* listInternal(`${path}/`, {...options, directory: file});
        }
    }
}

export function readFileNode(
    root: Directory,
    path: string | readonly string[]
): ReadFileNodeResult {
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
