#!/usr/bin/env node
import {fork} from "child_process";
import {promises as fs} from "fs";
import {dirname, relative, resolve, sep} from "path";
import {argv, cwd, exit} from "process";
import {allFn, append, filterFn, mapFn} from "@softwareventures/array";
import {JSDOM} from "jsdom";
import nonNull from "non-null";
import emptyDir = require("empty-dir");
import recursiveReadDir = require("recursive-readdir");
import formatXml = require("xml-formatter");
import {writePackageJson} from "./project/npm/write";
import {createProject, Project} from "./project/project";
import {copy} from "./task/copy";
import {mapResultFn, Result, YarnResult} from "./task/result";

export default async function init(project: Project): Promise<Result> {
    const mkdir = fs.mkdir(project.path, {recursive: true});
    const isDirectory = mkdir.then(
        () => true,
        reason => {
            if (reason?.code === "EEXIST") {
                return false;
            } else {
                throw reason;
            }
        }
    );

    if (!(await isDirectory)) {
        return {type: "not-directory"};
    }

    if (!(await emptyDir(project.path))) {
        return {type: "not-empty"};
    }

    return Promise.all([
        copy("github.template/workflows/ci.yml", project.path, ".github/workflows/ci.yml"),
        copy("eslintignore.template", project.path, ".eslintignore"),
        copy("gitignore.template", project.path, ".gitignore"),
        copy("npmignore.template", project.path, ".npmignore"),
        copy("prettierignore.template", project.path, ".prettierignore"),
        copy("renovate.lib.template.json", project.path, "renovate.json"),
        copy("tsconfig.template.json", project.path, "tsconfig.json"),
        copy("tsconfig.test.template.json", project.path, "tsconfig.test.json"),
        copy("index.ts", project.path),
        copy("index.test.ts", project.path),
        ideaProjectFiles(project),
        writePackageJson(project),
        dictionary(project.path),
        gitInit(project.path)
    ])
        .then(allFn(result => result.type === "success"))
        .then<Result>(success => (success ? {type: "success"} : {type: "not-empty"}))
        .then(mapResultFn(async () => yarnInstall(project.path)))
        .then(mapResultFn(async () => yarnFix(project.path)));
}

async function ideaProjectFiles(project: Project): Promise<Result> {
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
        .then(append([ideaModulesXml(project)]))
        .then(async results => Promise.all(results))
        .then(allFn(result => result.type === "success"))
        .then(success => (success ? {type: "success"} : {type: "not-empty"}));
}

async function ideaModulesXml(project: Project): Promise<Result> {
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

async function dictionary(destDir: string): Promise<Result> {
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

async function mkdir(path: string): Promise<Result> {
    return fs.mkdir(path, {recursive: true}).then(
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

async function gitInit(destDir: string): Promise<Result> {
    const templateDir = dirname(require.resolve("./template/git.template/HEAD"));

    const createDirectories = [
        mkdir(resolve(destDir, ".git", "objects", "info")),
        mkdir(resolve(destDir, ".git", "objects", "pack")),
        mkdir(resolve(destDir, ".git", "refs", "heads")),
        mkdir(resolve(destDir, ".git", "refs", "tags")),
        mkdir(resolve(destDir, ".git", "hooks"))
    ];

    const copyFiles = recursiveReadDir(templateDir)
        .then(mapFn(path => relative(templateDir, path)))
        .then(
            mapFn(async path => {
                const source = "git.template" + sep + path;
                const dest = ".git" + sep + path;

                return copy(source, destDir, dest);
            })
        );

    return copyFiles
        .then(async copyFiles => Promise.all([...createDirectories, ...copyFiles]))
        .then(allFn(result => result.type === "success"))
        .then(success => (success ? {type: "success"} : {type: "not-empty"}));
}

async function yarnInstall(dir: string): Promise<Result> {
    return yarn(dir).then(result =>
        result.type === "yarn-failed" ? {type: "yarn-install-failed"} : result
    );
}

async function yarnFix(dir: string): Promise<Result> {
    return yarn(dir, "fix").then(result =>
        result.type === "yarn-failed" ? {type: "yarn-fix-failed"} : result
    );
}

async function yarn(dir: string, ...args: string[]): Promise<YarnResult> {
    return new Promise((resolve, reject) =>
        fork(require.resolve("yarn/bin/yarn.js"), args, {cwd: dir, stdio: "inherit"})
            .on("error", reject)
            .on("exit", code => {
                if (code === 0) {
                    resolve({type: "success"});
                } else {
                    resolve({type: "yarn-failed"});
                }
            })
    );
}

function main(destDir: string): void {
    init(createProject({path: destDir}))
        .then(result => {
            switch (result.type) {
                case "success":
                    exit();
                    break;
                case "not-directory":
                    console.error("Target exists and is not a directory");
                    exit(1);
                    break;
                case "not-empty":
                    console.error("Directory not empty");
                    exit(1);
                    break;
                case "yarn-install-failed":
                    console.error("yarn install failed");
                    exit(1);
                    break;
                case "yarn-fix-failed":
                    console.error("Failed to apply code style rules");
                    exit(1);
                    break;
            }
        })
        .catch(reason => {
            if (!!reason && reason.message) {
                console.error(reason.message);
            } else {
                console.error(reason);
            }
            exit(1);
        });
}

if (require.main === module) {
    if (argv.length === 2) {
        main(cwd());
    } else if (argv.length === 3) {
        main(resolve(cwd(), argv[2]));
    } else {
        console.error("Invalid arguments");
        exit(1);
    }
}
