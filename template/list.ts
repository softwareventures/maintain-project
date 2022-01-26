import {relative, sep} from "path";
import {mapFn} from "@softwareventures/array";
import recursiveReadDir = require("recursive-readdir");
import {TemplateId, templatePath} from "./template";

export async function listTemplateFiles(
    templateId: TemplateId,
    ...pathSegments: string[]
): Promise<string[]> {
    const directoryPath = templatePath(templateId, ...pathSegments);
    return recursiveReadDir(directoryPath)
        .then(mapFn(path => relative(directoryPath, path)))
        .then(mapFn(path => path.split(sep)))
        .then(mapFn(path => path.join("/")));
}
