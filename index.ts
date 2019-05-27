import {allFn} from "@softwareventures/array";
import emptyDir = require("empty-dir");
import {constants, promises as fs} from "fs";
import {resolve} from "path";
import {cwd, exit} from "process";

export interface Success {
    type: "success";
}

export interface NotEmpty {
    type: "not-empty";
}

export type Result = Success | NotEmpty;

export default async function init(destDir: string): Promise<Result> {
    if (!await emptyDir(destDir)) {
        return {type: "not-empty"};
    }

    return Promise.all([
        copy("gitignore.template", destDir, ".gitignore"),
        copy("npmignore.template", destDir, ".npmignore"),
        copy("renovate.lib.template.json", destDir, "renovate.json"),
        copy("travis.template.yml", destDir, ".travis.yml"),
        copy("tsconfig.template.json", destDir, "tsconfig.json"),
        copy("tslint.template.json", destDir, "tslint.json")
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

if (require.main === module) {
    init(cwd())
        .then(result => {
            switch (result.type) {
                case "success":
                    return exit();
                case "not-empty":
                    console.error("Directory not empty");
                    return exit(1);
            }
        });
}