import {promises as fs} from "fs";
import {resolve} from "path";
import {hasProperty} from "unknown";
import type {Result} from "../result/result";
import {failure, success} from "../result/result";
import type {FileNotFound} from "../fs-stage/file-not-found";
import type {FileIsDirectory} from "../fs-stage/file-is-directory";
import type {ProjectSource} from "./project";

export type WriteTextResult = Result<WriteTextFailureReason>;

export type WriteTextFailureReason = FileNotFound | FileIsDirectory;

export async function writeProjectText(
    project: ProjectSource,
    path: string,
    text: string
): Promise<WriteTextResult> {
    const absolutePath = resolve(project.path, path);
    return fs.writeFile(absolutePath, text, "utf-8").then(
        () => success(),
        (reason: unknown) => {
            if (hasProperty(reason, "code")) {
                if (reason.code === "ENOENT") {
                    return failure([
                        {
                            type: "file-not-found",
                            path: absolutePath
                        }
                    ]);
                } else if (reason.code === "EISDIR") {
                    return failure([
                        {
                            type: "file-is-directory",
                            path: absolutePath
                        }
                    ]);
                }
            }

            throw reason;
        }
    );
}
