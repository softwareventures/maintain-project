import {Dirent, promises as fs} from "fs";
import {dirname, resolve} from "path";

export async function readTemplateDirectory(path: string): Promise<Dirent[]> {
    const templateDir = dirname(require.resolve("./template/index.ts"));
    const absolutePath = resolve(templateDir, path);
    return fs.readdir(absolutePath, {withFileTypes: true});
}
