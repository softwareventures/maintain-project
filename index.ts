import {allFn, append, filterFn, mapFn} from "@softwareventures/array";
import emptyDir = require("empty-dir");
import {constants, promises as fs} from "fs";
import {JSDOM} from "jsdom";
import nonNull from "non-null";
import {basename, dirname, relative, resolve, sep} from "path";
import {format as formatPackageJson} from "prettier-package-json";
import {argv, cwd, exit} from "process";
import recursiveReadDir = require("recursive-readdir");

export interface Success {
    type: "success";
}

export interface NotDirectory {
    type: "not-directory";
}

export interface NotEmpty {
    type: "not-empty";
}

export type Result = Success | NotDirectory | NotEmpty;

export default async function init(destDir: string): Promise<Result> {
    const mkdir = fs.mkdir(destDir, {recursive: true});
    const isDirectory = mkdir.then(() => true, reason => {
        if (reason.code === "EEXIST") {
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
        copy("gitignore.template", destDir, ".gitignore"),
        copy("npmignore.template", destDir, ".npmignore"),
        copy("renovate.lib.template.json", destDir, "renovate.json"),
        copy("travis.template.yml", destDir, ".travis.yml"),
        copy("tsconfig.template.json", destDir, "tsconfig.json"),
        copy("tslint.template.json", destDir, "tslint.json"),
        ideaProjectFiles(destDir),
        packageJson(destDir)
    ])
        .then(allFn(result => result.type === "success"))
        .then(success => success
            ? {type: "success"}
            : {type: "not-empty"});
}

function copy(source: string, destDir: string, destFile: string = source): Promise<Result> {
    const sourcePath = require.resolve("./template/" + source);
    const destPath = resolve(destDir, destFile);

    return fs.mkdir(dirname(destPath), {recursive: true})
        .then(() => fs.copyFile(sourcePath, destPath, constants.COPYFILE_EXCL))
        .then(() => ({type: "success"}),
            reason => {
                if (reason.code === "EEXIST") {
                    return {type: "not-empty"};
                } else {
                    throw reason;
                }
            });
}

function packageJson(destDir: string): Promise<Result> {
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
                "config", "ava"]
        }))
        .then(text => fs.writeFile(destPath, text, {encoding: "utf8", flag: "wx"}))
        .then(() => ({type: "success"}),
            reason => {
                if (reason.code === "EEXIST") {
                    return {type: "not-empty"};
                } else {
                    throw reason;
                }
            });
}

function ideaProjectFiles(destDir: string): Promise<Result> {
    const templateDir = dirname(require.resolve("./template/idea.template/create-project.iml"));
    const packageName = basename(destDir);

    const sourcePaths = recursiveReadDir(templateDir)
        .then(mapFn(path => relative(templateDir, path)))
        .then(filterFn(path => path.split(sep)[0] !== "dictionaries"))
        .then(filterFn(path => !path.match(/\.iml$/)))
        .then(filterFn(path => path !== "modules.xml"));

    return sourcePaths
        .then(mapFn(path => {
            const source = "idea.template" + sep + path;
            const dest = ".idea" + sep + path;

            return copy(source, destDir, dest);
        }))
        .then(append([
            copy("idea.template/create-project.iml", destDir, `.idea/${packageName}.iml`)
        ]))
        .then(append([ideaModulesXml(destDir)]))
        .then(results => Promise.all(results))
        .then(allFn(result => result.type === "success"))
        .then(success => success
            ? {type: "success"}
            : {type: "not-empty"});
}

function ideaModulesXml(destDir: string): Promise<Result> {
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
        .then(() => dom)
        .then(dom => dom.serialize());

    return newXmlText
        .then(newXmlText => fs.writeFile(destPath, newXmlText, {encoding: "utf8", flag: "wx"}))
        .then(() => ({type: "success"}),
            reason => {
                if (reason.code === "EEXIST") {
                    return {type: "not-empty"};
                } else {
                    throw reason;
                }
            });
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