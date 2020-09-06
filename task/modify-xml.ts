import {promises as fs} from "fs";
import {dirname} from "path";
import {JSDOM} from "jsdom";
import {Result} from "./result";

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

    const newXmlText = destPath.then(async () => dom).then(dom => dom.serialize());

    return Promise.all([destPath, newXmlText])
        .then(async ([destPath, newXmlText]) =>
            fs
                .mkdir(dirname(destPath), {recursive: true})
                .then(async () =>
                    fs.writeFile(destPath, newXmlText, {encoding: "utf8", flag: "wx"})
                )
        )
        .then(
            () => ({type: "success"}),
            reason => {
                if (reason.code === "EEXIST") {
                    return {type: "not-empty"};
                } else {
                    throw reason;
                }
            }
        );
}
