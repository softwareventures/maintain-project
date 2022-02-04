import {Document} from "yaml";
import {mapResultFn, Result} from "../result/result";
import {File, textFile} from "../fs-stage/file";
import {ProjectSource} from "./project";
import {readProjectYamlAsDocument, ReadYamlFailureReason} from "./read-yaml";

export async function modifyProjectYaml(
    project: ProjectSource,
    path: string,
    modify: (document: Document.Parsed) => Document.Parsed
): Promise<Result<ReadYamlFailureReason, File>> {
    return readProjectYamlAsDocument(project, path)
        .then(mapResultFn(modify))
        .then(mapResultFn(document => textFile(String(document))));
}
