import {Document} from "yaml";
import {File, textFile} from "../fs-stage/file";
import {readTemplateYamlAsDocument} from "./read-yaml";

export async function modifyTemplateYaml(
    path: string,
    modify: (document: Document.Parsed) => Document.Parsed
): Promise<File> {
    return readTemplateYamlAsDocument(path)
        .then(modify)
        .then(document => textFile(String(document)));
}
