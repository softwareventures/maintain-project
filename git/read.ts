import {ProjectSource} from "../project/project";
import {readProjectIgnore} from "../project/read-ignore";
import {GitProject} from "./git-project";

export async function readGitProject(project: ProjectSource): Promise<GitProject> {
    return readProjectIgnore(project, ".gitignore").then(ignore => ({ignore}));
}
