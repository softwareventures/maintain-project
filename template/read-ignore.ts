import {posix} from "path";
import {anyFn} from "@softwareventures/array";
import {mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import {readIgnore} from "../ignore/read";
import {failure, success} from "../result/result";
import type {Ignore} from "../ignore/ignore";
import {readTemplateDirectory} from "./read-directory";
import {readTemplateText} from "./read-text";
import type {TemplateId} from "./template";

export async function readTemplateIgnore(
    templateId: TemplateId,
    path: string,
    ...pathSegments: string[]
): Promise<Ignore> {
    return readIgnore({
        path: posix.join(path, ...pathSegments),
        basename: path => posix.basename(path),
        dirname: path => posix.dirname(path),
        join: (...paths) => posix.join(...paths),
        readDirectory: async path => readTemplateDirectory(templateId, path),
        readText: async path =>
            readTemplateDirectory(templateId, posix.dirname(path))
                .then(anyFn(dirent => dirent.name === posix.basename(path) && dirent.isFile()))
                .then(exists => (exists ? readTemplateText(templateId, path) : null))
                .then(mapNullableFn(text => success(text)))
                .then(mapNullFn(() => failure([{type: "file-not-found", path}])))
    });
}
