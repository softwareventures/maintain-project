import type {Dirent} from "fs";
import {promises as fs} from "fs";
import type {TemplateId} from "./template.js";
import {templatePath} from "./template.js";

export async function readTemplateDirectory(
    templateId: TemplateId,
    ...pathSegments: string[]
): Promise<Dirent[]> {
    return fs.readdir(templatePath(templateId, ...pathSegments), {withFileTypes: true});
}
