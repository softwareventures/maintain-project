import {promises as fs} from "fs";
import {allFn} from "@softwareventures/array";
import emptyDir = require("empty-dir");
import {copy} from "../task/copy";
import {mapResultFn, Result} from "../task/result";
import {gitInit} from "./git/init";
import {writeIdeaProjectFiles} from "./idea/write";
import {writeIdeaDictionary} from "./idea/write-dictionary";
import {writePackageJson} from "./npm/write";
import {Project} from "./project";
import {yarnFix} from "./yarn/fix";
import {yarnInstall} from "./yarn/install";

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
