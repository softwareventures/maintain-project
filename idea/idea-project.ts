import {IdeaDictionary} from "./dictionary/idea-dictionary";

export interface IdeaProject {
    readonly dictionaries: readonly IdeaDictionary[];
}
