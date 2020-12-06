import {filter, head, isArray, tail} from "@softwareventures/array";
import {insert as mapInsert} from "../collections/maps";
import {TextFile} from "./text-file";

export interface Directory {
    readonly type: "directory";
    readonly entries: ReadonlyMap<string, File>;
}

export type File = Directory | TextFile;

export const emptyDirectory: Directory = {type: "directory", entries: new Map()};

export type InsertResult = Directory | FileExists;

export interface FileExists {
    readonly type: "file-exists";
}

export function insert(
    root: Directory,
    path: string | readonly string[],
    file: File
): InsertResult {
    const pathSegments = isArray(path) ? path : path.split("/");
    return insertInternal(
        root,
        filter(pathSegments, segment => segment !== ""),
        file
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

function insertInternal(root: Directory, path: readonly string[], file: File): InsertResult {
    const entryName = head(path);

    if (entryName == null) {
        if (file.type === "directory") {
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

    const newEntry = existingEntry == null ? file : insertInternal(existingEntry, tail(path), file);

    if (newEntry.type === "file-exists") {
        return newEntry;
    } else {
        return {type: "directory", entries: mapInsert(root.entries, entryName, newEntry)};
    }
}

export interface ListOptions {
    readonly directory: Directory;
    readonly recursive?: boolean;
}

export interface Entry {
    readonly path: string;
    readonly file: File;
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
