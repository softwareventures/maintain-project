import {promises as fs} from "fs";
import type {File} from "../fs-stage/file.js";
import type {TemplateId} from "./template.js";
import {templatePath} from "./template.js";

export async function copyFromTemplate(
    templateId: TemplateId,
    path: string,
    ...pathSegments: string[]
): Promise<File> {
    return fs
        .readFile(templatePath(templateId, path, ...pathSegments))
        .then(data => ({type: "file", data}));
}
