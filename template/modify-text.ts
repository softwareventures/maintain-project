import {File} from "../fs-stage/file";
import {readTemplateText} from "./read-text";

export async function modifyTemplateText(
    path: string,
    modify: (text: string) => string
): Promise<File> {
    const text = readTemplateText(path);
    const newText = text.then(modify);
    const data = newText.then(newText => new TextEncoder().encode(newText));
    return data.then(data => ({type: "file", data}));
}
