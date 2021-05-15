import {JSDOM} from "jsdom";
import formatXml = require("xml-formatter");
import {File} from "../fs-stage/file";
import {readTemplateText} from "./read-text";

export async function modifyTemplateXml(
    path: string,
    modify: (dom: JSDOM) => JSDOM
): Promise<File> {
    const xmlText = readTemplateText(path);
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
