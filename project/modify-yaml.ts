import type {Document} from "yaml";
import type {Result} from "../result/result.js";
import {mapResultFn} from "../result/result.js";
import type {File} from "../fs-stage/file.js";
import {textFile} from "../fs-stage/file.js";
import type {ProjectSource} from "./project.js";
import type {ReadYamlFailureReason} from "./read-yaml.js";
import {readProjectYamlAsDocument} from "./read-yaml.js";

export async function modifyProjectYaml(
    project: ProjectSource,
    path: string,
    modify: (document: Document.Parsed) => Document.Parsed
): Promise<Result<ReadYamlFailureReason, File>> {
    return readProjectYamlAsDocument(project, path)
        .then(mapResultFn(modify))
        .then(mapResultFn(document => textFile(String(document))));
}
