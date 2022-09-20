import type {Document} from "yaml";
import {parse, parseDocument} from "yaml";
import {map} from "@softwareventures/array";
import {hasProperty} from "unknown";
import type {Result} from "../result/result";
import {bindResultFn, failure, mapResultFn, success} from "../result/result";
import type {ProjectSource} from "./project";
import type {ReadTextFailureReason} from "./read-text";
import {readProjectText} from "./read-text";

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
        .then(mapResultFn(parse))
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
        .catch((reason: unknown) => {
            if (hasProperty(reason, "code") || !(reason instanceof Error)) {
                throw reason;
            } else {
                return failure([{type: "invalid-yaml", reason, path}]);
            }
        });
}
