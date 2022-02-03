import {Document, parse, parseDocument} from "yaml";
import {map} from "@softwareventures/array";
import {bindResultFn, failure, mapResultFn, Result, success} from "../result/result";
import {ProjectSource} from "./project";
import {readProjectText, ReadTextFailureReason} from "./read-text";

export type ReadYamlResult = Result<ReadYamlFailureReason, any>;

export type ReadYamlFailureReason = ReadTextFailureReason | InvalidYaml;

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
        .then(mapResultFn(parse))
        .catch(reason => {
            if ("code" in reason) {
                throw reason;
            } else {
                return failure([{type: "invalid-yaml", reason, path}]);
            }
        });
}

export type ReadYamlAsDocumentResult = Result<ReadYamlFailureReason, Document.Parsed>;

export async function readProjectYamlAsDocument(
    project: ProjectSource,
    path: string
): Promise<ReadYamlAsDocumentResult> {
    return readProjectText(project, path)
        .then(mapResultFn(parseDocument))
        .then(
            bindResultFn<
                ReadTextFailureReason,
                ReadYamlFailureReason,
                Document.Parsed,
                Document.Parsed
            >(document =>
                document.errors.length === 0
                    ? success(document)
                    : failure(
                          map(document.errors, reason => ({type: "invalid-yaml", reason, path}))
                      )
            )
        )
        .catch(reason => {
            if ("code" in reason) {
                throw reason;
            } else {
                return failure([{type: "invalid-yaml", reason, path}]);
            }
        });
}
