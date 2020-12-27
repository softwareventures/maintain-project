import {resolve} from "path";
import {promises as fs} from "fs";
import chain from "@softwareventures/chain";
import {mapFn} from "../collections/iterators";
import {liftPromises, mapValueFn} from "../collections/maps";
import {ignoreIf} from "../promises/promises";
import {Success} from "../task/result";
import {Directory} from "./directory";
import {FsChangeset} from "./fs-changeset";
import {File} from "./file";

export type CommitResult = Success | CommitFailure;

export interface CommitFailure {
    readonly type: "commit-failure";
    readonly reasons: readonly CommitFailureReason[];
}

export type CommitFailureReason = FileExists;

export interface FileExists {
    readonly type: "file-exists";
    readonly path: string;
}

export async function commit(path: string, changeset: FsChangeset): Promise<CommitResult> {
    return open(path, changeset).then(async openResult => {
        switch (openResult.type) {
            case "open-fs-changeset":
                return write(openResult).then(() => ({type: "success"}));
            case "commit-failure":
                return openResult;
        }
    });
}

type OpenResult = OpenFsChangeset | CommitFailure;

interface OpenFsChangeset {
    readonly type: "open-fs-changeset";
    readonly openRoot: OpenDirectory;
}

async function open(path: string, changeset: FsChangeset): Promise<OpenResult> {
    const {root, overwrite = false} = changeset;
    return openDirectory({path, node: root, overwrite}).then(openRoot => ({
        type: "open-fs-changeset",
        path,
        openRoot
    }));
}

interface OpenOptions<T> {
    readonly path: string;
    readonly node: T;
    readonly overwrite: boolean;
}

type OpenNode = OpenDirectory | OpenFile;

interface OpenDirectory {
    readonly type: "open-directory";
    readonly entries: ReadonlyMap<string, OpenNode>;
}

interface OpenFile {
    readonly type: "open-file";
    readonly fileHandle: fs.FileHandle;
    readonly data: ArrayBufferLike;
}

async function openDirectory(options: OpenOptions<Directory>): Promise<OpenDirectory> {
    const {overwrite} = options;
    return fs
        .mkdir(options.path)
        .catch(
            ignoreIf(
                reason =>
                    overwrite &&
                    reason.code === "EEXIST" &&
                    fs.stat(options.path).then(stat => stat.isDirectory())
            )
        )
        .then(() => options.node.entries)
        .then(
            mapValueFn(async (node, relativePath) => {
                const path = resolve(options.path, relativePath);
                switch (node.type) {
                    case "directory":
                        return openDirectory({path, node, overwrite});
                    case "file":
                        return openFile({path, node, overwrite});
                }
            })
        )
        .then(liftPromises)
        .then(entries => ({type: "open-directory", entries}));
}

async function openFile(options: OpenOptions<File>): Promise<OpenFile> {
    const flags = options.overwrite ? "r+" : "wx+";
    return fs
        .open(options.path, flags)
        .then(fileHandle => ({type: "open-file", fileHandle, data: options.node.data}));
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
        .map(async results => Promise.resolve(results))
        .map(async promise => promise.then(() => undefined)).value;
}

async function writeFile(file: OpenFile): Promise<void> {
    return fs.writeFile(file.fileHandle, file.data);
}
