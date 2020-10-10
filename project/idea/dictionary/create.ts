import {promises as fs} from "fs";
import {IdeaDictionary} from "./idea-dictionary";

export async function createDefaultDictionary(): Promise<IdeaDictionary> {
    return fs
        .readFile(require.resolve("../../../template/dictionary.txt"), "utf8")
        .then(words => words.split("\n"))
        .then(words => ({name: "project", words}));
}
