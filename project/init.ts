import {promises as fs} from "fs";
import emptyDir = require("empty-dir");
import {copy} from "../task/copy";
import {combineResults, mapResultFn, Result} from "../task/result";
import {writeEslintIgnore} from "./eslint/write";
import {gitInit} from "./git/init";
import {writeGitIgnore} from "./git/write";
import {writeIdeaProjectFiles} from "./idea/write";
import {writeIdeaDictionary} from "./idea/write-dictionary";
import {writeNpmFiles} from "./npm/write";
import {writePrettierIgnore} from "./prettier/write";
import {Project} from "./project";
import {writeRenovateConfig} from "./renovate/write";
import {writeTypeScriptFiles} from "./typescript/write";
import {writeWebpackConfig} from "./webpack/write";
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

    return combineResults([
        copy("github.template/workflows/ci.yml", project.path, ".github/workflows/ci.yml"),
        writeRenovateConfig(project),
        writePrettierIgnore(project),
        writeGitIgnore(project),
        writeEslintIgnore(project),
        writeTypeScriptFiles(project),
        writeWebpackConfig(project),
        writeIdeaProjectFiles(project),
        writeNpmFiles(project),
        writeIdeaDictionary(project.path),
        gitInit(project.path)
    ])
        .then(mapResultFn(async () => yarnInstall(project.path)))
        .then(mapResultFn(async () => yarnFix(project.path)));
}
