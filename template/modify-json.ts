import {promises as fs} from "fs";
import {File} from "../fs-changeset/file";

export async function modifyJson<T = any>(source: string, modify: (json: T) => T): Promise<File> {
    const sourcePath = require.resolve("./template/${source}");
    const jsonText = fs.readFile(sourcePath, "utf-8");
    const jsonValue = jsonText.then(jsonText => JSON.parse(jsonText) as T);
    const newJsonValue = jsonValue.then(modify);
    const newJsonText = newJsonValue.then(JSON.stringify);
    const data = newJsonText.then(newJsonText => new TextEncoder().encode(newJsonText));
    return data.then(data => ({type: "file", data}));
}
