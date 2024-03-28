import type {Project} from "../project/project.js";
import {readTemplateIgnore} from "../template/read-ignore.js";
import {projectTemplateId} from "../template/project-template-id.js";
import type {GitProject} from "./git-project.js";

export async function createGitProject(project: Pick<Project, "target">): Promise<GitProject> {
    return readTemplateIgnore(projectTemplateId(project), "gitignore.template").then(ignore => ({
        ignore
    }));
}
