import {JSDOM} from "jsdom";
import formatXml = require("xml-formatter");
import {File} from "../fs-stage/file";
import {readTemplateText} from "./read-text";
import {TemplateId} from "./template";

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
    const xmlText = readTemplateText(templateId, ...pathSegments);
    const dom = xmlText.then(xmlText => new JSDOM(xmlText, {contentType: "application/xml"}));

    const newDom = dom.then(modify);
    const newXmlText = newDom
        .then(newDom => newDom.serialize())
        .then(newXmlText =>
            formatXml(newXmlText, {
                collapseContent: true,
                indentation: "  ",
                stripComments: true,
                whiteSpaceAtEndOfSelfclosingTag: true
            })
        );

    const data = newXmlText.then(newXmlText => new TextEncoder().encode(newXmlText));
    return data.then(data => ({type: "file", data}));
}
