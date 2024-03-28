import {promises as fs} from "fs";
import {fileURLToPath} from "url";
import {filterFn, mapFn} from "@softwareventures/array";
import {JSDOM} from "jsdom";
import formatXml from "xml-formatter";
import {textFile} from "../fs-stage/file.js";
import type {FsStage, InsertResult} from "../fs-stage/fs-stage.js";
import {insert} from "../fs-stage/fs-stage.js";

export async function writeIdeaDictionary(fsStage: FsStage): Promise<InsertResult> {
    const words = fs
        .readFile(fileURLToPath(import.meta.resolve("./dictionary.txt")), "utf-8")
        .then(text => text.split("\n"))
        .then(mapFn(word => word.trim()))
        .then(filterFn(word => word !== ""));

    const dom = new JSDOM("<component/>", {contentType: "application/xml"});
    const document = dom.window.document;

    const component = document.documentElement;
    component.setAttribute("name", "ProjectDictionaryState");

    const dictionaryElements = document.createElement("dictionary");
    dictionaryElements.setAttribute("name", "project");
    component.appendChild(dictionaryElements);

    const wordsElement = document.createElement("words");
    dictionaryElements.appendChild(wordsElement);

    const xmlText = words
        .then(words => words.sort())
        .then(
            mapFn(word => {
                const element = document.createElement("w");
                element.textContent = word;
                wordsElement.appendChild(element);
            })
        )
        .then(() =>
            formatXml(dom.serialize(), {
                collapseContent: true,
                indentation: "  ",
                stripComments: true,
                whiteSpaceAtEndOfSelfclosingTag: true
            })
        );

    const file = xmlText.then(xmlText => textFile(xmlText));

    return file.then(file => insert(fsStage, `.idea/dictionaries/project.xml`, file));
}
