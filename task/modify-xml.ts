import {promises as fs} from "fs";
import {JSDOM} from "jsdom";
import formatXml = require("xml-formatter");
import {Result} from "./result";
import {writeFile} from "./write-file";

export interface Destination {
    readonly destPath: string;
}

export async function modifyXml(
    source: string,
    modify: (document: Document) => Destination
): Promise<Result> {
    const sourcePath = require.resolve(`../template/${source}`);

    const xmlText = fs.readFile(sourcePath, "utf8");
    const dom = xmlText.then(xmlText => new JSDOM(xmlText, {contentType: "application/xml"}));
    const document = dom.then(dom => dom.window.document);

    const destPath = document.then(modify).then(({destPath}) => destPath);

    const newXmlText = destPath
        .then(async () => dom)
        .then(dom => dom.serialize())
        .then(newXmlText =>
            formatXml(newXmlText, {
                collapseContent: true,
                indentation: "  ",
                stripComments: true,
                whiteSpaceAtEndOfSelfclosingTag: true
            })
        );

    return Promise.all([destPath, newXmlText]).then(async ([destPath, newXmlText]) =>
        writeFile(destPath, newXmlText)
    );
}
