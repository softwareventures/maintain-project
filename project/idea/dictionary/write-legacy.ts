import {promises as fs} from "fs";
import {dirname, resolve} from "path";
import chain from "@softwareventures/chain";
import {filterFn, map, mapFn} from "@softwareventures/array";
import {JSDOM} from "jsdom";
import formatXml = require("xml-formatter");
import {combineResults, Result} from "../../../task/result";
import {Project} from "../../project";
import {IdeaDictionary} from "./idea-dictionary";

export async function writeIdeaDictionaries(project: Project): Promise<Result> {
    return combineResults(
        map(project.ideaProject?.dictionaries ?? [], async dictionary =>
            writeIdeaDictionary(project.path, dictionary)
        )
    );
}

export async function writeIdeaDictionary(
    destDir: string,
    dictionary: IdeaDictionary
): Promise<Result> {
    const dom = new JSDOM("<component/>", {contentType: "application/xml"});
    const document = dom.window.document;

    const component = document.documentElement;
    component.setAttribute("name", "ProjectDictionaryState");

    const dictionaryElements = document.createElement("dictionary");
    dictionaryElements.setAttribute("name", "project");
    component.appendChild(dictionaryElements);

    const wordsElement = document.createElement("words");
    dictionaryElements.appendChild(wordsElement);

    chain(dictionary.words)
        .map(filterFn(word => word !== ""))
        .map(mapFn(word => word.trim()))
        .map(words => words.sort())
        .map(
            mapFn(word => {
                const element = document.createElement("w");
                element.textContent = word;
                wordsElement.appendChild(element);
            })
        );

    const xmlText = formatXml(dom.serialize(), {
        collapseContent: true,
        indentation: "  ",
        stripComments: true,
        whiteSpaceAtEndOfSelfclosingTag: true
    });

    const destPath = resolve(destDir, ".idea", "dictionaries", `${dictionary.name}.xml`);

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
