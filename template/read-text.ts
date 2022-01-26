import {promises as fs} from "fs";
import {TemplateId, templatePath} from "./template";

export async function readTemplateText(
    templateId: TemplateId,
    path: string,
    ...pathSegments: string[]
): Promise<string> {
    return fs.readFile(templatePath(templateId, path, ...pathSegments), "utf-8");
}
