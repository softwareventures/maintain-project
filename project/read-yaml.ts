import {JSON_SCHEMA, load, YAMLException} from "js-yaml";
import {failure, Result, success} from "../result/result";
import {FileNotFound} from "../fs-stage/file-not-found";
import {ProjectSource} from "./project";
import {readProjectText} from "./read-text";

export type ReadYamlResult = Result<ReadYamlFailureReason, any>;

export type ReadYamlFailureReason = FileNotFound | InvalidYaml;

export interface InvalidYaml {
    readonly type: "invalid-yaml";
    readonly reason: YAMLException;
    readonly path: string;
}

export async function readProjectYaml(project: ProjectSource, path: string): Promise<ReadYamlResult> {
    return readProjectText(project, path)
        .then(text => load(text, {schema: JSON_SCHEMA}))
        .then(yaml => success(yaml),
            reason => {
                if (reason.code === "ENOENT") {
                    return failure([{type: "file-not-found", path}]);
                } else if (reason instanceof YAMLException) {
                    return failure([{type: "invalid-yaml", reason, path}]);
                } else {
                    throw reason;
                }
            });
}