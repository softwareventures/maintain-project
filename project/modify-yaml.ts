import type {Document} from "yaml";
import type {Result} from "../result/result";
import {mapResultFn} from "../result/result";
import type {File} from "../fs-stage/file";
import {textFile} from "../fs-stage/file";
import type {ProjectSource} from "./project";
import type {ReadYamlFailureReason} from "./read-yaml";
import {readProjectYamlAsDocument} from "./read-yaml";

export async function modifyProjectYaml(
    project: ProjectSource,
    path: string,
    modify: (document: Document.Parsed) => Document.Parsed
): Promise<Result<ReadYamlFailureReason, File>> {
    return readProjectYamlAsDocument(project, path)
        .then(mapResultFn(modify))
        .then(mapResultFn(document => textFile(String(document))));
}
