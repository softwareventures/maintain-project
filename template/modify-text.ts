import {promises as fs} from "fs";
import {File} from "../fs-stage/file";

export async function modifyText(source: string, modify: (text: string) => string): Promise<File> {
    const sourcePath = require.resolve(`./template/${source}`);
    const text = fs.readFile(sourcePath, "utf-8");
    const newText = text.then(modify);
    const data = newText.then(newText => new TextEncoder().encode(newText));
    return data.then(data => ({type: "file", data}));
}
