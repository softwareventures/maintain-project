import type {FileNode} from "./file-node";

export interface Directory {
    readonly type: "directory";
    readonly entries: ReadonlyMap<string, FileNode>;
}

export const emptyDirectory: Directory = {type: "directory", entries: new Map()};

export interface ListOptions {
    readonly directory: Directory;
    readonly recursive?: boolean | undefined;
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
        if ((options.recursive ?? false) && file.type === "directory") {
            yield* listInternal(`${path}/`, {...options, directory: file});
        }
    }
}
