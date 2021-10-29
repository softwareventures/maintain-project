import {basename, dirname} from "path";
import {anyFn} from "@softwareventures/array";
import {mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import {readIgnore} from "../ignore/read";
import {failure, success} from "../result/result";
import {Ignore} from "../ignore/ignore";
import {readTemplateDirectory} from "./read-directory";
import {readTemplateText} from "./read-text";

export async function readTemplateIgnore(name: string): Promise<Ignore> {
    return readIgnore({
        path: name,
        readDirectory: async path => readTemplateDirectory(path),
        readText: async path =>
            readTemplateDirectory(dirname(path))
                .then(anyFn(dirent => dirent.name === basename(path) && dirent.isFile()))
                .then(exists => (exists ? readTemplateText(path) : null))
                .then(mapNullableFn(text => success(text)))
                .then(mapNullFn(() => failure([{type: "file-not-found", path}])))
    });
}
