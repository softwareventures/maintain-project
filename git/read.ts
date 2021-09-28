import {ProjectSource} from "../project/project";
import {GitProject} from "./git-project";
import {readGitIgnore} from "./ignore/read";

export async function readGitProject(project: ProjectSource): Promise<GitProject> {
    return readGitIgnore(project).then(ignore => ({ignore}));
}
