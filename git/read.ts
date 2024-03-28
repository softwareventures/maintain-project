import type {ProjectSource} from "../project/project.js";
import {readProjectIgnore} from "../project/read-ignore.js";
import type {GitProject} from "./git-project.js";

export async function readGitProject(project: ProjectSource): Promise<GitProject> {
    return readProjectIgnore(project, ".gitignore").then(ignore => ({ignore}));
}
