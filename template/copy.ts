import {promises as fs} from "fs";
import type {File} from "../fs-stage/file";
import type {TemplateId} from "./template";
import {templatePath} from "./template";

export async function copyFromTemplate(
    templateId: TemplateId,
    path: string,
    ...pathSegments: string[]
): Promise<File> {
    return fs
        .readFile(templatePath(templateId, path, ...pathSegments))
        .then(data => ({type: "file", data}));
}
