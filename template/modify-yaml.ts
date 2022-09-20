import type {Document} from "yaml";
import type {File} from "../fs-stage/file";
import {textFile} from "../fs-stage/file";
import {readTemplateYamlAsDocument} from "./read-yaml";
import type {TemplateId} from "./template";

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
