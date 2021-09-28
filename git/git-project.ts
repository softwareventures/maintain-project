import {GitIgnore} from "./ignore/git-ignore";

export interface GitProject {
    readonly ignore: GitIgnore;
}
