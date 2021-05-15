import {File} from "../fs-stage/file";
import {readTemplateText} from "./read-text";

export async function modifyTemplateText(
    source: string,
    modify: (text: string) => string
): Promise<File> {
    const text = readTemplateText(source);
    const newText = text.then(modify);
    const data = newText.then(newText => new TextEncoder().encode(newText));
    return data.then(data => ({type: "file", data}));
}
