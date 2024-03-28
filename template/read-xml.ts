import {JSDOM} from "jsdom";
import type {TemplateId} from "./template.js";
import {readTemplateText} from "./read-text.js";

export async function readTemplateXml(
    templateId: TemplateId,
    path: string,
    ...pathSegments: string[]
): Promise<JSDOM> {
    return readTemplateText(templateId, path, ...pathSegments).then(
        text => new JSDOM(text, {contentType: "application/xml"})
    );
}
