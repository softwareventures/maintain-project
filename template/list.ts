import {dirname, relative, resolve, sep} from "path";
import {mapFn} from "@softwareventures/array";
import recursiveReadDir = require("recursive-readdir");

export async function listTemplates(path: string): Promise<string[]> {
    const templateDir = dirname(require.resolve("./template/index.ts"));
    const relativeDir = resolve(templateDir, path);
    return recursiveReadDir(relativeDir)
        .then(mapFn(path => relative(relativeDir, path)))
        .then(mapFn(path => path.split(sep)))
        .then(mapFn(path => path.join("/")));
}
