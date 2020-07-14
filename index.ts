#!/usr/bin/env/node
import {fork} from "child_process";
import {constants, promises as fs} from "fs";
import {basename, dirname, relative, resolve, sep} from "path";
import {argv, cwd, exit} from "process";
import {allFn, append, filterFn, mapFn} from "@softwareventures/array";
import emptyDir = require("empty-dir");
import {JSDOM} from "jsdom";
import nonNull from "non-null";
import {format as formatPackageJson} from "prettier-package-json";
import recursiveReadDir = require("recursive-readdir");
import formatXml = require("xml-formatter");

export interface Success {
    type: "success";
}

export interface NotDirectory {
    type: "not-directory";
}

export interface NotEmpty {
    type: "not-empty";
}

export interface YarnInstallFailed {
    type: "yarn-install-failed";
}

export type Result = Success | NotDirectory | NotEmpty | YarnInstallFailed;

export default async function init(destDir: string): Promise<Result> {
    const mkdir = fs.mkdir(destDir, {recursive: true});
    const isDirectory = mkdir.then(() => true, reason => {
        if (reason?.code === "EEXIST") {
            return false;
        } else {
            throw reason;
        }
    });

    if (!await isDirectory) {
        return {type: "not-directory"};
    }

    if (!await emptyDir(destDir)) {
        return {type: "not-empty"};
    }

    return Promise.all([
        copy("github.template/workflows/ci.yml", destDir, ".github/workflows/ci.yml"),
        copy("gitignore.template", destDir, ".gitignore"),
        copy("npmignore.template", destDir, ".npmignore"),
        copy("renovate.lib.template.json", destDir, "renovate.json"),
        copy("tsconfig.template.json", destDir, "tsconfig.json"),
        copy("tslint.template.json", destDir, "tslint.json"),
        copy("index.ts", destDir),
        copy("index.test.ts", destDir),
        ideaProjectFiles(destDir),
        packageJson(destDir),
        dictionary(destDir),
        gitInit(destDir)
    ])
        .then(allFn(result => result.type === "success"))
        .then(success => success
            ? yarnInstall(destDir)
            : {type: "not-empty"});
}

async function copy(source: string, destDir: string, destFile: string = source): Promise<Result> {
    const sourcePath = require.resolve("./template/" + source);
    const destPath = resolve(destDir, destFile);

    return fs.mkdir(dirname(destPath), {recursive: true})
        .then(async () => fs.copyFile(sourcePath, destPath, constants.COPYFILE_EXCL))
        .then(() => ({type: "success"}),
            reason => {
                if (reason.code === "EEXIST") {
                    return {type: "not-empty"};
                } else {
                    throw reason;
                }
            });
}

async function packageJson(destDir: string): Promise<Result> {
    const sourcePath = require.resolve("./template/package.json");
    const destPath = resolve(destDir, "package.json");

    const packageName = basename(dirname(destPath));

    return fs.readFile(sourcePath, {encoding: "utf8"})
        .then(text => JSON.parse(text))
        .then(json => ({
            ...json,
            name: `@softwareventures/${packageName}`,
            homepage: `https://github.com/softwareventures/${packageName}`,
            bugs: `https://github.com/softwareventures/${packageName}`,
            repository: `github:softwareventures/${packageName}`
        }))
        .then(json => formatPackageJson(json, {
            keyOrder: ["private", "name", "version", "description", "keywords", "author", "maintainers",
                "contributors", "homepage", "bugs", "repository", "license", "scripts", "main", "module", "browser",
                "man", "preferGlobal", "bin", "files", "directories", "sideEffects", "types", "typings",
                "dependencies", "optionalDependencies", "bundleDependencies", "bundledDependencies",
                "peerDependencies", "devDependencies", "engines", "engine-strict", "engineStrict", "os", "cpu",
                "config", "ava", "release"]
        }))
        .then(async text => fs.writeFile(destPath, text, {encoding: "utf8", flag: "wx"}))
        .then(() => ({type: "success"}),
            reason => {
                if (reason.code === "EEXIST") {
                    return {type: "not-empty"};
                } else {
                    throw reason;
                }
            });
}

async function ideaProjectFiles(destDir: string): Promise<Result> {
    const templateDir = dirname(require.resolve("./template/idea.template/create-project.iml"));
    const packageName = basename(destDir);

    const sourcePaths = recursiveReadDir(templateDir)
        .then(mapFn(path => relative(templateDir, path)))
        .then(filterFn(path => path.split(sep)[0] !== "dictionaries"))
        .then(filterFn(path => path !== "workspace.xml"))
        .then(filterFn(path => path !== "tasks.xml"))
        .then(filterFn(path => !path.match(/\.iml$/)))
        .then(filterFn(path => path !== "modules.xml"));

    return sourcePaths
        .then(mapFn(async path => {
            const source = "idea.template" + sep + path;
            const dest = ".idea" + sep + path;

            return copy(source, destDir, dest);
        }))
        .then(append([
            copy("idea.template/create-project.iml", destDir, `.idea/${packageName}.iml`)
        ]))
        .then(append([ideaModulesXml(destDir)]))
        .then(async results => Promise.all(results))
        .then(allFn(result => result.type === "success"))
        .then(success => success
            ? {type: "success"}
            : {type: "not-empty"});
}

async function ideaModulesXml(destDir: string): Promise<Result> {
    const sourcePath = require.resolve("./template/idea.template/modules.xml");
    const destPath = resolve(destDir, ".idea/modules.xml");
    const packageName = basename(destDir);

    const xmlText = fs.readFile(sourcePath, "utf8");
    const dom = xmlText.then(xmlText => new JSDOM(xmlText, {contentType: "application/xml"}));
    const document = dom.then(dom => dom.window.document);

    const module = document.then(document => document.querySelector("project:root>component>modules>module"))
        .then(nonNull);

    const newXmlText = module
        .then(module => {
            module.setAttribute("fileurl", nonNull(module.getAttribute("fileurl"))
                .replace(/create-project\.iml$/, packageName + ".iml"));
            module.setAttribute("filepath", nonNull(module.getAttribute("filepath"))
                .replace(/create-project\.iml$/, packageName + ".iml"));
        })
        .then(async () => dom)
        .then(dom => dom.serialize());

    return newXmlText
        .then(async newXmlText => fs.writeFile(destPath, newXmlText, {encoding: "utf8", flag: "wx"}))
        .then(() => ({type: "success"}),
            reason => {
                if (reason.code === "EEXIST") {
                    return {type: "not-empty"};
                } else {
                    throw reason;
                }
            });
}

async function dictionary(destDir: string): Promise<Result> {
    const words = fs.readFile(require.resolve("./template/dictionary.txt"), "utf8")
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
        .then(mapFn(word => {
            const element = document.createElement("w");
            element.textContent = word;
            wordsElement.appendChild(element);
        }));

    const xmlText = wordElements
        .then(() => dom.serialize())
        .then(xmlText => formatXml(xmlText, {
            collapseContent: true,
            indentation: "  ",
            stripComments: true
        }));

    const destPath = resolve(destDir, ".idea/dictionaries/project.xml");

    return fs.mkdir(dirname(destPath), {recursive: true})
        .then(async () => xmlText)
        .then(async xmlText => fs.writeFile(destPath, xmlText, {encoding: "utf8", flag: "wx"}))
        .then(() => ({type: "success"}),
            reason => {
                if (reason.code === "EEXIST") {
                    return {type: "not-empty"};
                } else {
                    throw reason;
                }
            });
}

async function mkdir(path: string): Promise<Result> {
    return fs.mkdir(path, {recursive: true})
        .then(() => ({type: "success"}),
            reason => {
                if (reason.code === "EEXIST") {
                    return {type: "not-empty"};
                } else {
                    throw reason;
                }
            });
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
        .then(mapFn(async path => {
            const source = "git.template" + sep + path;
            const dest = ".git" + sep + path;

            return copy(source, destDir, dest);
        }));

    return copyFiles
        .then(async copyFiles => Promise.all([...createDirectories, ...copyFiles]))
        .then(allFn(result => result.type === "success"))
        .then(success => success
            ? {type: "success"}
            : {type: "not-empty"});
}

async function yarnInstall(dir: string): Promise<Result> {
    return new Promise((resolve, reject) =>
        fork(require.resolve("yarn/bin/yarn.js"), [], {cwd: dir, stdio: "inherit"})
            .on("error", reject)
            .on("exit", code => {
                if (code === 0) {
                    resolve({type: "success"});
                } else {
                    resolve({type: "yarn-install-failed"});
                }
            }));
}

function main(destDir: string): void {
    init(destDir)
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