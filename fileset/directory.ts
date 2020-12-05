import {filter, head, isArray, tail} from "@softwareventures/array";
import {insert as mapInsert} from "../collections/maps";
import {TextFile} from "./text-file";

export interface Directory {
    readonly type: "directory";
    readonly entries: ReadonlyMap<string, DirectoryEntry>;
}

export type DirectoryEntry = Directory | TextFile;

export const emptyDirectory: Directory = {type: "directory", entries: new Map()};

export type InsertResult = Directory | FileExists;

export interface FileExists {
    readonly type: "file-exists";
}

export function insert(
    root: Directory,
    path: string | readonly string[],
    entry: DirectoryEntry
): InsertResult {
    const pathSegments = isArray(path) ? path : path.split("/");
    return insertInternal(
        root,
        filter(pathSegments, segment => segment !== ""),
        entry
    );
}

export function insertSubdirectory(
    root: Directory,
    path: string | readonly string[]
): InsertResult {
    return insert(root, path, emptyDirectory);
}

export function insertTextFile(
    root: Directory,
    path: string | readonly string[],
    text: string
): InsertResult {
    return insert(root, path, {type: "text-file", text});
}

function insertInternal(
    root: Directory,
    path: readonly string[],
    entry: DirectoryEntry
): InsertResult {
    const entryName = head(path);

    if (entryName == null) {
        if (entry.type === "directory") {
            return root;
        } else {
            return {type: "file-exists"};
        }
    }

    const defaultEntry = path.length > 1 ? emptyDirectory : undefined;
    const existingEntry = root.entries.get(entryName) ?? defaultEntry;

    if (existingEntry != null && existingEntry.type !== "directory") {
        return {type: "file-exists"};
    }

    const newEntry =
        existingEntry == null ? entry : insertInternal(existingEntry, tail(path), entry);

    if (newEntry.type === "file-exists") {
        return newEntry;
    } else {
        return {type: "directory", entries: mapInsert(root.entries, entryName, newEntry)};
    }
}
