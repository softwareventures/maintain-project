import {resolve} from "path";
import {promises as fs} from "fs";
import {liftPromises, mapValueFn} from "../collections/maps";
import {ignoreIf} from "../promises/promises";
import {Success} from "../task/result";
import {Directory} from "./directory";
import {FsChangeset} from "./fs-changeset";
import {TextFile} from "./text-file";

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

type OpenResult = OpenFsChangeset | CommitFailure;

interface OpenFsChangeset {
    readonly type: "open-fs-changeset";
    readonly openRoot: OpenDirectory;
}

async function open(path: string, changeset: FsChangeset): Promise<OpenResult> {
    const {root, overwrite = false} = changeset;
    return openDirectory({path, file: root, overwrite}).then(openRoot => ({
        type: "open-fs-changeset",
        openRoot
    }));
}

interface OpenOptions<T> {
    readonly path: string;
    readonly file: T;
    readonly overwrite: boolean;
}

type OpenFile = OpenDirectory | OpenTextFile;

interface OpenDirectory {
    readonly type: "open-directory";
    readonly entries: ReadonlyMap<string, OpenFile>;
}

interface OpenTextFile {
    readonly type: "open-text-file";
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
        .then(() => options.file.entries)
        .then(
            mapValueFn(async (file, relativePath) => {
                const path = resolve(options.path, relativePath);
                switch (file.type) {
                    case "directory":
                        return openDirectory({path, file, overwrite});
                    case "text-file":
                        return openTextFile({path, file, overwrite});
                }
            })
        )
        .then(liftPromises)
        .then(entries => ({type: "open-directory", entries}));
}

async function openTextFile(options: OpenOptions<TextFile>): Promise<OpenTextFile> {
    const flags = options.overwrite ? "r+" : "wx+";
    return fs.open(options.path, flags).then(fileHandle => ({type: "open-text-file", fileHandle}));
}
