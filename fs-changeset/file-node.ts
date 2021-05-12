import {promises as fs} from "fs";
import {resolve, sep} from "path";
import {readFileNode as readFileNodeFromStage} from "../fs-stage/file-node";
import {bindFailureAsyncFn, failure, success} from "../result/result";
import {ReadFileNodeResult} from "../fs-stage/read-file-node-result";
import {file} from "../fs-stage/file";
import {resolvePathSegments} from "../fs-stage/path";
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
        .readFile(resolve(changeset.path, path.join(sep)))
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
