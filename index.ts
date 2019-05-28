import {allFn} from "@softwareventures/array";
import {constants, promises as fs} from "fs";
import {basename, dirname, resolve} from "path";
import {argv, cwd, exit} from "process";
import emptyDir = require("empty-dir");

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

    return fs.copyFile(sourcePath, destPath, constants.COPYFILE_EXCL)
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
        .then(JSON.parse)
        .then(json => ({
            ...json,
            name: `@softwareventures/${packageName}`,
            homepage: `https://github.com/softwareventures/${packageName}`,
            bugs: `https://github.com/softwareventures/${packageName}`,
            repository: `github:softwareventures/${packageName}`
        }))
        .then(JSON.stringify)
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