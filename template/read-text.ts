import {promises as fs} from "fs";
import type {TemplateId} from "./template.js";
import {templatePath} from "./template.js";

export async function readTemplateText(
    templateId: TemplateId,
    path: string,
    ...pathSegments: string[]
): Promise<string> {
    return fs.readFile(templatePath(templateId, path, ...pathSegments), "utf-8");
}
