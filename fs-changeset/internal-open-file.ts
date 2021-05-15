import {resolve} from "path";
import {failure, Failure, Result, success} from "../result/result";
import {insert} from "../collections/maps";
import {InternalDirectory} from "./internal-directory";
import {InternalFileNode} from "./internal-file-node";
import {internalOpenUnderlyingFile} from "./internal-open-underlying-file";

export type InternalOpenFileFailureReason =
    | InternalInvalidFilename
    | InternalModifiedByAnotherProcess;

export interface InternalInvalidFilename {
    readonly type: "internal-invalid-filename";
    readonly filename: string;
}

function internalInvalidFilename(filename: string): Failure<InternalInvalidFilename> {
    return failure([{type: "internal-invalid-filename", filename}]);
}

interface InternalModifiedByAnotherProcess {
    readonly type: "internal-modified-by-another-process";
    readonly filename: string;
}

function internalModifiedByAnotherProcess(
    filename: string
): Failure<InternalModifiedByAnotherProcess> {
    return failure([{type: "internal-modified-by-another-process", filename}]);
}

export type InternalOpenFileResult = Result<
    InternalOpenFileFailureReason,
    {readonly parent: InternalDirectory; readonly node: InternalFileNode}
>;

export async function internalOpenFile(
    directory: InternalDirectory,
    filename: string
): Promise<InternalOpenFileResult> {
    if (filename.indexOf("/") !== -1) {
        return internalInvalidFilename(filename);
    }

    const existingNode = directory.entries.get(filename);

    const underlyingFile = await internalOpenUnderlyingFile(resolve(directory.path, filename));

    if (existingNode == null) {
        return success({
            parent: {
                ...directory,
                entries: insert(directory.entries, filename, underlyingFile)
            },
            node: underlyingFile
        });
    } else if (existingNode.type === "fs-changeset-internal-no-file") {
        if (underlyingFile.type === "fs-changeset-internal-no-file") {
            return success({parent: directory, node: existingNode});
        } else {
            return internalModifiedByAnotherProcess(filename);
        }
    } else if (
        existingNode.type !== underlyingFile.type ||
        existingNode.underlyingMTime !== underlyingFile.underlyingMTime
    ) {
        return internalModifiedByAnotherProcess(filename);
    } else {
        return success({parent: directory, node: existingNode});
    }
}
