import {Dirent, promises as fs} from "fs";
import {TemplateId, templatePath} from "./template";

export async function readTemplateDirectory(
    templateId: TemplateId,
    ...pathSegments: string[]
): Promise<Dirent[]> {
    return fs.readdir(templatePath(templateId, ...pathSegments), {withFileTypes: true});
}
