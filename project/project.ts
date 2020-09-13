import {createGithubProject, GithubProject, GithubProjectOptions} from "./github/github-project";
import {createNpmPackage, NpmPackage, NpmPackageOptions} from "./npm/npm-package";

export interface Project extends ProjectOptions {
    readonly npmPackage: NpmPackage;
    readonly githubProject: GithubProject;
    readonly target: "npm" | "webapp";
}

export interface ProjectOptions {
    readonly path: string;
    readonly npmPackage?: NpmPackageOptions;
    readonly githubProject?: GithubProjectOptions;
    readonly target?: "npm" | "webapp";
}

export function createProject(options: ProjectOptions): Project {
    return {
        path: options.path,
        npmPackage: createNpmPackage(options),
        githubProject: createGithubProject(options),
        target: options.target ?? "npm"
    };
}
