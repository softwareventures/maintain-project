import {tail} from "@softwareventures/array";
import {
    bindAsyncResultFn,
    failure,
    mapFailureFn,
    mapResultFn,
    Result,
    success
} from "../result/result";
import {resolvePathSegments} from "../fs-stage/path";
import {FsChangeset} from "./fs-changeset";
import {FileNode} from "./file-node";
import {internalOpenFile, InternalOpenFileFailureReason} from "./internal-open-file";
import {InternalDirectory} from "./internal-directory";
import {InternalFileNode} from "./internal-file-node";

export interface InvalidPath {
    readonly type: "invalid-path";
    readonly path: string;
}

export function invalidPath(path: string): InvalidPath {
    return {type: "invalid-path", path};
}

export interface NotADirectory {
    readonly type: "not-a-directory";
    readonly path: string;
}

export function notADirectory(path: string): NotADirectory {
    return {type: "not-a-directory", path};
}

export interface FileNotFound {
    readonly type: "file-not-found";
    readonly path: string;
}

export function fileNotFound(path: string): FileNotFound {
    return {type: "file-not-found", path};
}

export interface ModifiedByAnotherProcess {
    readonly type: "modified-by-another-process";
    readonly path: string;
}

export function modifiedByAnotherProcess(path: string): ModifiedByAnotherProcess {
    return {type: "modified-by-another-process", path};
}

export type OpenFileFailureReason =
    | InvalidPath
    | NotADirectory
    | FileNotFound
    | ModifiedByAnotherProcess;

export type OpenFileResult = Result<
    OpenFileFailureReason,
    {readonly changeset: FsChangeset; readonly node: FileNode}
>;

export async function openFile(changeset: FsChangeset, path: string): Promise<OpenFileResult> {
    const openRecursive = async (
        node: InternalFileNode,
        path: readonly string[]
    ): Promise<
        Result<
            OpenFileFailureReason,
            {readonly internalUpdate: InternalFileNode; readonly node: FileNode}
        >
    > => {
        if (path.length === 0) {
            if (node.type === "fs-changeset-internal-no-file") {
                return failure([fileNotFound("")]);
            } else if (node.type === "fs-changeset-internal-directory") {
                return success({
                    internalUpdate: node,
                    node: {type: "fs-changeset-directory", path: []}
                });
            } else {
                return success({internalUpdate: node, node: {type: "fs-changeset-file", path: []}});
            }
        } else if (node.type === "fs-changeset-internal-directory") {
            return internalOpenFile(node, path[0])
                .then(
                    mapFailureFn<
                        InternalOpenFileFailureReason,
                        {readonly parent: InternalDirectory; readonly node: InternalFileNode},
                        OpenFileFailureReason
                    >(reason => {
                        switch (reason.type) {
                            case "internal-invalid-filename":
                                return invalidPath(path[0]);
                            case "internal-modified-by-another-process":
                                return modifiedByAnotherProcess(path[0]);
                        }
                    })
                )
                .then(
                    bindAsyncResultFn(async ({parent, node}) =>
                        openRecursive(node, tail(path))
                            .then(mapResultFn(({node}) => ({internalUpdate: parent, node})))
                            .then(
                                mapFailureFn(reason => ({
                                    ...reason,
                                    path: `${path[0]}/${reason.path}`
                                }))
                            )
                    )
                );
        } else {
            return failure([notADirectory(path[0])]);
        }
    };

    const segments = resolvePathSegments(path);

    if (segments == null) {
        return failure([invalidPath(path)]);
    } else {
        return openRecursive(changeset.root, segments).then(
            mapResultFn(({internalUpdate, node}) => ({
                changeset: {
                    ...changeset,
                    root: internalUpdate
                },
                node
            }))
        );
    }
}
