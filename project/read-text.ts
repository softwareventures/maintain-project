import {promises as fs} from "fs";
import {resolve} from "path";
import {failure, Result, success} from "../result/result";
import {FileNotFound} from "../fs-stage/file-not-found";
import {ProjectSource} from "./project";

export type ReadTextResult = Result<FileNotFound, string>;

export async function readProjectText(
    project: ProjectSource,
    path: string
): Promise<ReadTextResult> {
    return fs.readFile(resolve(project.path, path), "utf-8").then(
        text => success(text),
        reason => {
            if (reason.code === "ENOENT") {
                return failure([{type: "file-not-found", path}]);
            } else {
                throw reason;
            }
        }
    );
}
