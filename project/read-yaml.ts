import {parse} from "yaml";
import {failure, Result, success} from "../result/result";
import {FileNotFound} from "../fs-stage/file-not-found";
import {ProjectSource} from "./project";
import {readProjectText} from "./read-text";

export type ReadYamlResult = Result<ReadYamlFailureReason, any>;

export type ReadYamlFailureReason = FileNotFound | InvalidYaml;

export interface InvalidYaml {
    readonly type: "invalid-yaml";
    readonly reason: Error;
    readonly path: string;
}

export async function readProjectYaml(
    project: ProjectSource,
    path: string
): Promise<ReadYamlResult> {
    return readProjectText(project, path)
        .then(text => parse(text))
        .then(
            yaml => success(yaml),
            reason => {
                if (reason.code === "ENOENT") {
                    return failure([{type: "file-not-found", path}]);
                } else if ("code" in reason) {
                    throw reason;
                } else {
                    return failure([{type: "invalid-yaml", reason, path}]);
                }
            }
        );
}
