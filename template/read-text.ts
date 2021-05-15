import {promises as fs} from "fs";

export async function readTemplateText(path: string): Promise<string> {
    return fs.readFile(require.resolve(`./template/${path}`), "utf-8");
}
