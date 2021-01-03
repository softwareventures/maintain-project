import {dirname, relative, sep} from "path";
import {append, filterFn, mapFn} from "@softwareventures/array";
import recursiveReadDir = require("recursive-readdir");
import {copy} from "../../task/copy";
import {combineResults, Result} from "../../task/result";
import {Project} from "../project";
import {writeIdeaDictionaries} from "./dictionary/write-legacy";
import {writeIdeaModuleIml} from "./write-module-iml-legacy";
import {writeIdeaModulesXml} from "./write-modules-xml-legacy";
import {writeIdeaRunConfigurations} from "./write-run-configurations-legacy";

export async function writeIdeaProjectFiles(project: Project): Promise<Result> {
    const templateDir = dirname(
        require.resolve("../../template/template/idea.template/maintain-project.iml")
    );

    const sourcePaths = recursiveReadDir(templateDir)
        .then(mapFn(path => relative(templateDir, path)))
        .then(filterFn(path => path.split(sep)[0] !== "dictionaries"))
        .then(filterFn(path => path.split(sep)[0] !== "runConfigurations"))
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
                writeIdeaModulesXml(project),
                writeIdeaModuleIml(project),
                writeIdeaDictionaries(project)
            ])
        )
        .then(append(writeIdeaRunConfigurations(project)))
        .then(combineResults);
}