import type {Document} from "yaml";
import yaml from "yaml";
import {readTemplateText} from "./read-text.js";
import type {TemplateId} from "./template.js";

export async function readTemplateYamlAsDocument(
    templateId: TemplateId,
    path: string,
    ...pathSegments: string[]
): Promise<Document.Parsed> {
    return readTemplateText(templateId, path, ...pathSegments)
        .then(text => yaml.parseDocument(text))
        .then(document => {
            if (document.errors.length === 0) {
                return document;
            } else {
                throw new Error("Invalid Template YAML");
            }
        });
}
