import {promises as fs} from "fs";
import {resolve} from "path";
import {hasProperty} from "unknown";
import type {Result} from "../result/result";
import {failure, success} from "../result/result";
import type {FileNotFound} from "../fs-stage/file-not-found";
import type {FileIsDirectory} from "../fs-stage/file-is-directory";
import type {ProjectSource} from "./project";

export type ReadTextResult = Result<ReadTextFailureReason, string>;

export type ReadTextFailureReason = FileNotFound | FileIsDirectory;

export async function readProjectText(
    project: ProjectSource,
    path: string
): Promise<ReadTextResult> {
    return fs.readFile(resolve(project.path, path), "utf-8").then(
        text => success(text),
        (reason: unknown) => {
            if (hasProperty(reason, "code")) {
                if (reason.code === "ENOENT") {
                    return failure([{type: "file-not-found", path}]);
                } else if (reason.code === "EISDIR") {
                    return failure([{type: "file-is-directory", path}]);
                }
            }

            throw reason;
        }
    );
}
