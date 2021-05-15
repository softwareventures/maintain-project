import {createDefaultDictionary} from "./dictionary/create";
import {IdeaProject} from "./idea-project";

export async function createIdeaProject(): Promise<IdeaProject> {
    return createDefaultDictionary().then(dictionary => ({dictionaries: [dictionary]}));
}
