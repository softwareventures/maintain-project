import {filter, head, isArray, tail} from "@softwareventures/array";
import chain from "@softwareventures/chain";
import {insert as mapInsert} from "../collections/maps";
import {mapFailureFn, mapResultFn, Result} from "../result/result";
import {FileExists} from "./file-exists";
import {FileNode} from "./file-node";

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
    const pathSegments = isArray(path) ? path : path.split("/");
    return insertInternal(
        root,
        filter(pathSegments, segment => segment !== ""),
        node
    );
}

export function insertSubdirectory(
    root: Directory,
    path: string | readonly string[]
): InsertResult {
    return insert(root, path, emptyDirectory);
}

function insertInternal(root: Directory, path: readonly string[], file: FileNode): InsertResult {
    const entryName = head(path);

    if (entryName == null) {
        if (file.type === "directory") {
            return {type: "success", value: root};
        } else {
            return {type: "failure", reasons: [{type: "file-exists", path: ""}]};
        }
    }

    const defaultEntry = path.length > 1 ? emptyDirectory : undefined;
    const existingEntry = root.entries.get(entryName) ?? defaultEntry;

    if (existingEntry == null) {
        return {
            type: "success",
            value: {...root, entries: mapInsert(root.entries, entryName, file)}
        };
    } else if (existingEntry.type !== "directory") {
        return {type: "failure", reasons: [{type: "file-exists", path: entryName}]};
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
