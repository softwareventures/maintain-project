import {promises as fs} from "fs";
import {dirname, relative, resolve, sep} from "path";
import {allFn, append, filterFn, mapFn} from "@softwareventures/array";
import {JSDOM} from "jsdom";
import nonNull from "non-null";
import recursiveReadDir = require("recursive-readdir");
import formatXml = require("xml-formatter");
import {copy} from "../../task/copy";
import {Result} from "../../task/result";
import {Project} from "../project";

export async function writeIdeaProjectFiles(project: Project): Promise<Result> {
    const templateDir = dirname(require.resolve("./template/idea.template/create-project.iml"));

    const sourcePaths = recursiveReadDir(templateDir)
        .then(mapFn(path => relative(templateDir, path)))
        .then(filterFn(path => path.split(sep)[0] !== "dictionaries"))
        .then(filterFn(path => path !== "workspace.xml"))
        .then(filterFn(path => path !== "task.xml"))
        .then(filterFn(path => !path.match(/\.iml$/)))
        .then(filterFn(path => path !== "modules.xml"));

    return sourcePaths
        .then(
            mapFn(async path => {
                const source = "idea.template" + sep + path;
                const dest = ".idea" + sep + path;

                return copy(source, project.path, dest);
            })
        )
        .then(
            append([
                copy(
                    "idea.template/create-project.iml",
                    project.path,
                    `.idea/${project.npmPackage.name}.iml`
                )
            ])
        )
        .then(append([writeIdeaModulesXml(project)]))
        .then(async results => Promise.all(results))
        .then(allFn(result => result.type === "success"))
        .then(success => (success ? {type: "success"} : {type: "not-empty"}));
}

async function writeIdeaModulesXml(project: Project): Promise<Result> {
    const sourcePath = require.resolve("./template/idea.template/modules.xml");
    const destPath = resolve(project.path, ".idea", "modules.xml");

    const xmlText = fs.readFile(sourcePath, "utf8");
    const dom = xmlText.then(xmlText => new JSDOM(xmlText, {contentType: "application/xml"}));
    const document = dom.then(dom => dom.window.document);

    const module = document
        .then(document => document.querySelector("project:root>component>modules>module"))
        .then(nonNull);

    const newXmlText = module
        .then(module => {
            module.setAttribute(
                "fileurl",
                nonNull(module.getAttribute("fileurl")).replace(
                    /create-project\.iml$/,
                    project.npmPackage.name + ".iml"
                )
            );
            module.setAttribute(
                "filepath",
                nonNull(module.getAttribute("filepath")).replace(
                    /create-project\.iml$/,
                    project.npmPackage.name + ".iml"
                )
            );
        })
        .then(async () => dom)
        .then(dom => dom.serialize());

    return newXmlText
        .then(async newXmlText =>
            fs.writeFile(destPath, newXmlText, {encoding: "utf8", flag: "wx"})
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
