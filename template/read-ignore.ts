import {readIgnore} from "../ignore/read";
import {success} from "../result/result";
import {Ignore} from "../ignore/ignore";
import {readTemplateDirectory} from "./read-directory";
import {readTemplateText} from "./read-text";

export async function readTemplateIgnore(name: string): Promise<Ignore> {
    return readIgnore({
        path: name,
        readDirectory: async path => readTemplateDirectory(path),
        readText: async path => readTemplateText(path).then(text => success(text))
    });
}
