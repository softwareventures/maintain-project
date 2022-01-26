import {promises as fs} from "fs";
import {File} from "../fs-stage/file";
import {TemplateId, templatePath} from "./template";

export async function copyFromTemplate(
    templateId: TemplateId,
    path: string,
    ...pathSegments: string[]
): Promise<File> {
    return fs
        .readFile(templatePath(templateId, path, ...pathSegments))
        .then(data => ({type: "file", data}));
}
