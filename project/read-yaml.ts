import type {Document} from "yaml";
import yaml from "yaml";
import {map} from "@softwareventures/array";
import {hasProperty} from "unknown";
import type {Result} from "../result/result.js";
import {bindResultFn, failure, mapResultFn, success} from "../result/result.js";
import type {ProjectSource} from "./project.js";
import type {ReadTextFailureReason} from "./read-text.js";
import {readProjectText} from "./read-text.js";

// FIXME Use `unknown` instead
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        .then(mapResultFn(yaml.parse))
        .catch((reason: unknown) => {
            if (hasProperty(reason, "code") || !(reason instanceof Error)) {
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
        .then(mapResultFn(yaml.parseDocument))
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
        .catch((reason: unknown) => {
            if (hasProperty(reason, "code") || !(reason instanceof Error)) {
                throw reason;
            } else {
                return failure([{type: "invalid-yaml", reason, path}]);
            }
        });
}
