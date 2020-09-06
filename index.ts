#!/usr/bin/env node
import {promises as fs} from "fs";
import {resolve} from "path";
import {argv, cwd, exit} from "process";
import {allFn} from "@softwareventures/array";
import emptyDir = require("empty-dir");
import {gitInit} from "./project/git/init";
import {writeIdeaDictionary, writeIdeaProjectFiles} from "./project/idea/write";
import {writePackageJson} from "./project/npm/write";
import {createProject, Project} from "./project/project";
import {yarnFix} from "./project/yarn/fix";
import {yarnInstall} from "./project/yarn/install";
import {copy} from "./task/copy";
import {mapResultFn, Result} from "./task/result";

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
        writeIdeaProjectFiles(project),
        writePackageJson(project),
        writeIdeaDictionary(project.path),
        gitInit(project.path)
    ])
        .then(allFn(result => result.type === "success"))
        .then<Result>(success => (success ? {type: "success"} : {type: "not-empty"}))
        .then(mapResultFn(async () => yarnInstall(project.path)))
        .then(mapResultFn(async () => yarnFix(project.path)));
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
