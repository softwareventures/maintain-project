import {ProjectOptions} from "../project/project";
import {readTemplateIgnore} from "../template/read-ignore";
import {GitProject} from "./git-project";

export async function createGitProject(options: ProjectOptions): Promise<GitProject> {
    return readTemplateIgnore("gitignore.template").then(ignore => ({ignore}));
}
