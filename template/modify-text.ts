import type {File} from "../fs-stage/file.js";
import {readTemplateText} from "./read-text.js";
import type {TemplateId} from "./template.js";

export interface ModifyTemplateTextOptions {
    readonly templateId: TemplateId;
    readonly pathSegments: readonly [string, ...string[]];
    readonly modify: (text: string) => string;
}

export async function modifyTemplateText({
    templateId,
    pathSegments,
    modify
}: ModifyTemplateTextOptions): Promise<File> {
    const text = readTemplateText(templateId, ...pathSegments);
    const newText = text.then(modify);
    const data = newText.then(newText => new TextEncoder().encode(newText));
    return data.then(data => ({type: "file", data}));
}
