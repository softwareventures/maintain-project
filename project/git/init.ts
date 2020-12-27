import {dirname, relative, resolve, sep} from "path";
import {allFn, mapFn} from "@softwareventures/array";
import recursiveReadDir = require("recursive-readdir");
import {copy} from "../../task/copy";
import {mkdir} from "../../task/mkdir";
import {Result} from "../../task/result";

export async function gitInit(destDir: string): Promise<Result> {
    const templateDir = dirname(
        require.resolve("../../template/template/template/git.template/HEAD")
    );

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
