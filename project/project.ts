import {createGitHost, GitHost, GitHostOptions} from "./git/git-host";
import {createIdeaProject} from "./idea/create";
import {IdeaProject} from "./idea/idea-project";
import {createNpmPackage, NpmPackage, NpmPackageOptions} from "./npm/npm-package";

export interface Project {
    readonly path: string;
    readonly npmPackage: NpmPackage;
    readonly gitHost?: GitHost;
    readonly target: "npm" | "webapp";
    readonly ideaProject?: IdeaProject;
}

export interface ProjectOptions {
    readonly path: string;
    readonly npmPackage?: NpmPackageOptions;
    readonly gitHost?: GitHostOptions;
    readonly target?: "npm" | "webapp";
}

export async function createProject(options: ProjectOptions): Promise<Project> {
    return createIdeaProject().then(ideaProject => ({
        path: options.path,
        npmPackage: createNpmPackage(options),
        gitHost: createGitHost(options),
        target: options.target ?? "npm",
        ideaProject
    }));
}
