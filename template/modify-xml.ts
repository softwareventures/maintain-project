import {promises as fs} from "fs";
import {JSDOM} from "jsdom";
import formatXml = require("xml-formatter");
import {File} from "../fs-changeset/file";

export async function modifyXml(source: string, modify: (dom: JSDOM) => JSDOM): Promise<File> {
    const sourcePath = require.resolve(`./template/${source}`);

    const xmlText = fs.readFile(sourcePath, "utf-8");
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
