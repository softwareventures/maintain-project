import {File} from "../fs-stage/file";
import {readProjectText} from "./read-text";
import {ProjectSource} from "./project";

export async function modifyProjectText(
    project: ProjectSource,
    path: string,
    modify: (text: string) => string
): Promise<File> {
    const text = readProjectText(project, path);
    const newText = text.then(modify);
    const data = newText.then(newText => new TextEncoder().encode(newText));
    return data.then(data => ({type: "file", data}));
}
