import type {JSDOM} from "jsdom";
import type {File} from "../fs-stage/file.js";
import {formatIdeaXml} from "../idea/format-idea-xml.js";
import type {TemplateId} from "./template.js";
import {readTemplateXml} from "./read-xml.js";

export interface ModifyTemplateXmlOptions {
    readonly templateId: TemplateId;
    readonly pathSegments: readonly [string, ...string[]];
    readonly modify: (dom: JSDOM) => JSDOM;
}

export async function modifyTemplateXml({
    templateId,
    pathSegments,
    modify
}: ModifyTemplateXmlOptions): Promise<File> {
    const dom = readTemplateXml(templateId, ...pathSegments);

    const newDom = dom.then(modify);
    const newXmlText = newDom.then(formatIdeaXml);

    const data = newXmlText.then(newXmlText => new TextEncoder().encode(newXmlText));
    return data.then(data => ({type: "file", data}));
}
