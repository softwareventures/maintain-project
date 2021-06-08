import {promises as fs} from "fs";
import {resolve} from "path";
import chain from "@softwareventures/chain";
import {mapFn} from "@softwareventures/iterable";
import {liftPromises, liftResults, mapValue} from "../collections/maps";
import {failure, mapAsyncResultFn, mapResultFn, Result, success} from "../result/result";
import {Directory} from "./directory";
import {File} from "./file";
import {FileExists} from "./file-exists";
import {FsStage} from "./fs-stage";
import {NotADirectory} from "./not-a-directory";

export type CommitResult = Result<CommitFailureReason>;

export type CommitFailureReason = NotADirectory | FileExists;

export async function commit(path: string, stage: FsStage): Promise<CommitResult> {
    return open(path, stage).then(mapAsyncResultFn(write));
}

type OpenResult = Result<OpenFailureReason, OpenFsStage>;

interface OpenFsStage {
    readonly type: "open-fs-stage";
    readonly openRoot: OpenDirectory;
}

async function open(path: string, stage: FsStage): Promise<OpenResult> {
    const {root, overwrite = false} = stage;
    return openDirectory({path, node: root, overwrite}).then(
        mapResultFn(openRoot => ({
            type: "open-fs-stage",
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

type OpenFailureReason = NotADirectory | FileExists;

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
        } else if (await fs.stat(options.path).then(stat => !stat.isDirectory())) {
            return failure([{type: "not-a-directory", path: options.path}]);
        } else if (!overwrite) {
            return failure([{type: "file-exists", path: options.path}]);
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
    return fs
        .open(options.path, flags)
        .catch(async reason => {
            if (reason.code === "ENOENT" && options.overwrite) {
                return fs.open(options.path, "wx+");
            } else {
                throw reason;
            }
        })
        .then(
            fileHandle => success({type: "open-file", fileHandle, data: options.node.data}),
            reason => {
                if (reason.code === "EEXIST") {
                    return failure([{type: "file-exists", path: options.path}]);
                } else {
                    throw reason;
                }
            }
        );
}

async function write(stage: OpenFsStage): Promise<void> {
    return writeDirectory(stage.openRoot);
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
