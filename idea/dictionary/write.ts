import {filterFn, map, mapFn} from "@softwareventures/array";
import chain from "@softwareventures/chain";
import {JSDOM} from "jsdom";
import formatXml = require("xml-formatter");
import {textFile} from "../../fs-stage/file";
import {FsStage, insert, InsertResult} from "../../fs-stage/fs-stage";
import {chainAsyncResultsFn} from "../../result/result";
import {Project} from "../../project/project";
import {IdeaDictionary} from "./idea-dictionary";

export function writeIdeaDictionaries(
    project: Project
): (fsStage: FsStage) => Promise<InsertResult> {
    return chainAsyncResultsFn(map(project.ideaProject?.dictionaries ?? [], writeIdeaDictionary));
}

function writeIdeaDictionary(
    dictionary: IdeaDictionary
): (fsStage: FsStage) => Promise<InsertResult> {
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

    const file = textFile(xmlText);

    return async fsStage => insert(fsStage, `.idea/dictionaries/${dictionary.name}.xml`, file);
}
