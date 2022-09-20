import type {Document} from "yaml";
import {parseDocument} from "yaml";
import {readTemplateText} from "./read-text";
import type {TemplateId} from "./template";

export async function readTemplateYamlAsDocument(
    templateId: TemplateId,
    path: string,
    ...pathSegments: string[]
): Promise<Document.Parsed> {
    return readTemplateText(templateId, path, ...pathSegments)
        .then(text => parseDocument(text))
        .then(document => {
            if (document.errors.length === 0) {
                return document;
            } else {
                throw new Error("Invalid Template YAML");
            }
        });
}
