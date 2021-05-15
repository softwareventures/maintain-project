import {filterFn} from "@softwareventures/array";
import {File} from "../fs-stage/file";
import {readTemplateText} from "./read-text";

export async function filterTemplateIgnore(
    source: string,
    filter: (line: string) => boolean
): Promise<File> {
    const text = readTemplateText(source);
    const filteredText = text
        .then(text => text.split(/\r?\n/))
        .then(filterFn(filter))
        .then(lines => lines.join("\n"));
    const data = filteredText.then(text => new TextEncoder().encode(text));
    return data.then(data => ({type: "file", data}));
}
