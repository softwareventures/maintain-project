import {promises as fs} from "fs";
import {resolve} from "path";
import {TextDecoder} from "util";
import {FileNode, readFileNode as readFileNodeFromStage} from "../fs-stage/file-node";
import {bindFailureAsyncFn, bindResultFn, failure, Result, success} from "../result/result";
import {ReadFileNodeResult} from "../fs-stage/read-file-node-result";
import {file} from "../fs-stage/file";
import {resolvePathSegments} from "../fs-stage/path";
import {ReadFileFailureReason} from "../fs-stage/read-file-failure-reason";
import {FsChangeset} from "./fs-changeset";
import {joinPath} from "./path";

export async function readFileNode(
    changeset: FsChangeset,
    path: string
): Promise<ReadFileNodeResult> {
    const segments = resolvePathSegments(path);
    if (segments == null) {
        return failure([{type: "invalid-path", path}]);
    }

    return readFileNodeInternal(changeset, segments);
}

async function readFileNodeInternal(
    changeset: FsChangeset,
    path: readonly string[]
): Promise<ReadFileNodeResult> {
    if (changeset.changeRoot == null) {
        return readUnderlyingFileNode(changeset, path);
    } else {
        return Promise.resolve(readFileNodeFromStage(changeset.changeRoot, joinPath(path))).then(
            bindFailureAsyncFn(async reasons =>
                reasons.length === 1 && reasons[0]?.type === "file-not-found"
                    ? readUnderlyingFileNode(changeset, path)
                    : failure(reasons)
            )
        );
    }
}

async function readUnderlyingFileNode(
    changeset: FsChangeset,
    path: readonly string[]
): Promise<ReadFileNodeResult> {
    return fs
        .readFile(resolve(changeset.path, ...path))
        .then(data => success(file(data)))
        .catch(reason => {
            switch (reason.code) {
                case "EISDIR":
                    return failure([{type: "file-is-directory", path: joinPath(path)}]);
                case "ENOENT":
                    return failure([{type: "file-not-found", path: joinPath(path)}]);
                case "ENOTDIR":
                    return failure([{type: "not-a-directory", path: joinPath(path)}]);
                default:
                    throw reason;
            }
        });
}

export type ReadTextFileResult = Result<ReadFileFailureReason, string>;

export async function readTextFile(
    changeset: FsChangeset,
    path: string
): Promise<ReadTextFileResult> {
    return readFileNode(changeset, path).then(
        bindResultFn<ReadFileFailureReason, ReadFileFailureReason, FileNode, string>(node =>
            node.type === "file"
                ? success(new TextDecoder().decode(node.data))
                : failure([{type: "file-is-directory", path}])
        )
    );
}
