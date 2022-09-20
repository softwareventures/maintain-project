import type {Project} from "../project/project";
import {readTemplateIgnore} from "../template/read-ignore";
import {projectTemplateId} from "../template/project-template-id";
import type {GitProject} from "./git-project";

export async function createGitProject(project: Pick<Project, "target">): Promise<GitProject> {
    return readTemplateIgnore(projectTemplateId(project), "gitignore.template").then(ignore => ({
        ignore
    }));
}
