import {filter, head, isArray, tail} from "@softwareventures/array";
import {insert} from "../collections/maps";
import {TextFile} from "./text-file";

export interface Directory {
    readonly type: "directory";
    readonly entries: ReadonlyMap<string, Directory | TextFile>;
}

export type InsertSubdirectoryResult = Directory | FileExists;

export interface FileExists {
    readonly type: "file-exists";
}

export function insertSubdirectory(
    root: Directory,
    path: string | readonly string[]
): InsertSubdirectoryResult {
    const pathSegments = isArray(path) ? path : path.split("/");
    return insertSubdirectoryInternal(
        root,
        filter(pathSegments, segment => segment !== "")
    );
}

function insertSubdirectoryInternal(
    root: Directory,
    path: readonly string[]
): InsertSubdirectoryResult {
    const entryName = head(path);

    if (entryName == null) {
        return root;
    }

    const entry = root.entries.get(entryName) ?? {type: "directory", entries: new Map()};

    if (entry.type === "directory") {
        const subdirectory = insertSubdirectoryInternal(entry, tail(path));
        if (subdirectory.type === "directory") {
            return {type: "directory", entries: insert(root.entries, entryName, subdirectory)};
        } else {
            return subdirectory;
        }
    } else {
        return {type: "file-exists"};
    }
}
