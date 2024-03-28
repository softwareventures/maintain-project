import type {Document} from "yaml";
import type {Result} from "../result/result.js";
import type {WriteTextFailureReason} from "./write-text.js";
import {writeProjectText} from "./write-text.js";
import type {ProjectSource} from "./project.js";

export type WriteYamlResult = Result<WriteYamlFailureReason>;

export type WriteYamlFailureReason = WriteTextFailureReason;

export async function writeProjectYaml(
    project: ProjectSource,
    path: string,
    yaml: Document.Parsed
): Promise<WriteYamlResult> {
    return writeProjectText(project, path, String(yaml));
}
