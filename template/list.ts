import {dirname, relative, resolve, sep} from "path";
import {mapFn} from "@softwareventures/array";
import recursiveReadDir = require("recursive-readdir");

export async function listTemplates(path: string): Promise<string[]> {
    const templateDir = dirname(require.resolve("./template/index.ts"));
    return recursiveReadDir(resolve(templateDir, path))
        .then(mapFn(path => relative(templateDir, path)))
        .then(mapFn(path => path.split(sep)))
        .then(mapFn(path => path.join("/")));
}
