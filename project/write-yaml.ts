import type {Document} from "yaml";
import type {Result} from "../result/result";
import type {WriteTextFailureReason} from "./write-text";
import {writeProjectText} from "./write-text";
import type {ProjectSource} from "./project";

export type WriteYamlResult = Result<WriteYamlFailureReason>;

export type WriteYamlFailureReason = WriteTextFailureReason;

export async function writeProjectYaml(
    project: ProjectSource,
    path: string,
    yaml: Document.Parsed
): Promise<WriteYamlResult> {
    return writeProjectText(project, path, String(yaml));
}
