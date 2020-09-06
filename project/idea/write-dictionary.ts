import {promises as fs} from "fs";
import {dirname, resolve} from "path";
import {filterFn, mapFn} from "@softwareventures/array";
import {JSDOM} from "jsdom";
import formatXml = require("xml-formatter");
import {Result} from "../../task/result";

export async function writeIdeaDictionary(destDir: string): Promise<Result> {
    const words = fs
        .readFile(require.resolve("./template/dictionary.txt"), "utf8")
        .then(words => words.split("\n"));

    const dom = new JSDOM("<component/>", {contentType: "application/xml"});
    const document = dom.window.document;

    const component = document.documentElement;
    component.setAttribute("name", "ProjectDictionaryState");

    const dictionary = document.createElement("dictionary");
    dictionary.setAttribute("name", "project");
    component.appendChild(dictionary);

    const wordsElement = document.createElement("words");
    dictionary.appendChild(wordsElement);

    const wordElements = words
        .then(filterFn(word => word !== ""))
        .then(mapFn(word => word.trim()))
        .then(words => words.sort())
        .then(
            mapFn(word => {
                const element = document.createElement("w");
                element.textContent = word;
                wordsElement.appendChild(element);
            })
        );

    const xmlText = wordElements
        .then(() => dom.serialize())
        .then(xmlText =>
            formatXml(xmlText, {
                collapseContent: true,
                indentation: "  ",
                stripComments: true
            })
        );

    const destPath = resolve(destDir, ".idea/dictionaries/project.xml");

    return fs
        .mkdir(dirname(destPath), {recursive: true})
        .then(async () => xmlText)
        .then(async xmlText => fs.writeFile(destPath, xmlText, {encoding: "utf8", flag: "wx"}))
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
