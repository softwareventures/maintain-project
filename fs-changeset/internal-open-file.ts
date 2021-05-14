import {promises as fs} from "fs";
import {resolve} from "path";
import {failure, Failure, Result, success} from "../result/result";
import {insert} from "../collections/maps";
import {internalDirectory, InternalDirectory} from "./internal-directory";
import {internalFile} from "./internal-file";
import {InternalFileNode} from "./internal-file-node";
import {internalNoFile} from "./internal-no-file";
import {internalSpecialFile} from "./internal-special-file";

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

    const stat = await fs.stat(resolve(directory.path, filename), {bigint: true}).catch(reason => {
        if (reason.code === "ENOENT") {
            return null;
        } else {
            throw reason;
        }
    });

    if (existingNode == null) {
        const newNode =
            stat == null
                ? internalNoFile
                : stat.isDirectory()
                ? internalDirectory({
                      path: `${directory.path}/${filename}`,
                      underlyingMTime: stat.mtimeMs
                  })
                : stat.isFile()
                ? internalFile(stat.mtimeMs)
                : internalSpecialFile(stat.mtimeMs);

        return success({
            parent: {
                ...directory,
                entries: insert(directory.entries, filename, newNode)
            },
            node: newNode
        });
    } else if (
        existingNode.type === "fs-changeset-internal-no-file" ||
        (existingNode.underlyingMTime === stat?.mtimeMs ?? null)
    ) {
        return success({parent: directory, node: existingNode});
    } else {
        return internalModifiedByAnotherProcess(filename);
    }
}
