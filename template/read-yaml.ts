import {Document, parseDocument} from "yaml";
import {readTemplateText} from "./read-text";

export async function readTemplateYamlAsDocument(path: string): Promise<Document.Parsed> {
    return readTemplateText(path)
        .then(text => parseDocument(text))
        .then(document => {
            if (document.errors.length === 0) {
                return document;
            } else {
                throw new Error("Invalid Template YAML");
            }
        });
}
