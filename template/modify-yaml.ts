import {Document} from "yaml";
import {File, textFile} from "../fs-stage/file";
import {readTemplateYamlAsDocument} from "./read-yaml";
import {TemplateId} from "./template";

export interface ModifyTemplateYamlOptions {
    readonly templateId: TemplateId;
    readonly pathSegments: readonly [string, ...string[]];
    readonly modify: (document: Document.Parsed) => Document.Parsed;
}

export async function modifyTemplateYaml({
    templateId,
    pathSegments,
    modify
}: ModifyTemplateYamlOptions): Promise<File> {
    return readTemplateYamlAsDocument(templateId, ...pathSegments)
        .then(modify)
        .then(document => textFile(String(document)));
}
