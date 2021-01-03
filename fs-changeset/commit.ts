import {promises as fs} from "fs";
import {resolve} from "path";
import chain from "@softwareventures/chain";
import {mapFn} from "../collections/iterators";
import {liftPromises, liftResults, mapValue} from "../collections/maps";
import {mapAsyncResultFn, mapResultFn, Result} from "../result/result";
import {Directory} from "./directory";
import {File} from "./file";
import {FileExists} from "./file-exists";
import {FsChangeset} from "./fs-changeset";

export type CommitResult = Result<CommitFailureReason>;

export type CommitFailureReason = FileExists;

export async function commit(path: string, changeset: FsChangeset): Promise<CommitResult> {
    return open(path, changeset).then(mapAsyncResultFn(write));
}

type OpenResult = Result<OpenFailureReason, OpenFsChangeset>;

interface OpenFsChangeset {
    readonly type: "open-fs-changeset";
    readonly openRoot: OpenDirectory;
}

async function open(path: string, changeset: FsChangeset): Promise<OpenResult> {
    const {root, overwrite = false} = changeset;
    return openDirectory({path, node: root, overwrite}).then(
        mapResultFn(openRoot => ({
            type: "open-fs-changeset",
            path,
            openRoot
        }))
    );
}

interface OpenOptions<T> {
    readonly path: string;
    readonly node: T;
    readonly overwrite: boolean;
}

type OpenNodeResult = Result<OpenFailureReason, OpenNode>;

type OpenNode = OpenDirectory | OpenFile;

type OpenFailureReason = FileExists;

type OpenDirectoryResult = Result<OpenFailureReason, OpenDirectory>;

interface OpenDirectory {
    readonly type: "open-directory";
    readonly entries: ReadonlyMap<string, OpenNode>;
}

type OpenFileResult = Result<OpenFailureReason, OpenFile>;

interface OpenFile {
    readonly type: "open-file";
    readonly fileHandle: fs.FileHandle;
    readonly data: ArrayBufferLike;
}

async function openDirectory(options: OpenOptions<Directory>): Promise<OpenDirectoryResult> {
    const {overwrite} = options;

    try {
        await fs.mkdir(options.path);
    } catch (reason) {
        if (reason.code !== "EEXIST") {
            throw reason;
        } else if (!overwrite || (await fs.stat(options.path).then(stat => !stat.isDirectory()))) {
            return {type: "failure", reasons: [{type: "file-exists", path: options.path}]};
        }
    }

    const openEntries = mapValue(options.node.entries, async (node, relativePath) => {
        const path = resolve(options.path, relativePath);
        switch (node.type) {
            case "directory":
                return openDirectory({path, node, overwrite});
            case "file":
                return openFile({path, node, overwrite});
        }
    });

    return liftPromises<string, OpenNodeResult>(openEntries)
        .then(liftResults)
        .then(mapResultFn(entries => ({type: "open-directory", entries})));
}

async function openFile(options: OpenOptions<File>): Promise<OpenFileResult> {
    const flags = options.overwrite ? "r+" : "wx+";
    return fs.open(options.path, flags).then(
        fileHandle => ({
            type: "success",
            value: {type: "open-file", fileHandle, data: options.node.data}
        }),
        reason => {
            if (reason.code === "EEXIST") {
                return {type: "failure", reasons: [{type: "file-exists", path: options.path}]};
            } else {
                throw reason;
            }
        }
    );
}

async function write(changeset: OpenFsChangeset): Promise<void> {
    return writeDirectory(changeset.openRoot);
}

async function writeDirectory(directory: OpenDirectory): Promise<void> {
    return chain(directory.entries.values())
        .map(
            mapFn(async node => {
                switch (node.type) {
                    case "open-directory":
                        return writeDirectory(node);
                    case "open-file":
                        return writeFile(node);
                }
            })
        )
        .map(async results => Promise.all(results))
        .map(async promise => promise.then(() => undefined)).value;
}

async function writeFile(file: OpenFile): Promise<void> {
    return fs.writeFile(file.fileHandle, file.data).then(async () => file.fileHandle.close());
}
