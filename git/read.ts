import {ProjectSource} from "../project/project";
import {readGitIgnore} from "../ignore/read";
import {GitProject} from "./git-project";

export async function readGitProject(project: ProjectSource): Promise<GitProject> {
    return readGitIgnore(project).then(ignore => ({ignore}));
}
