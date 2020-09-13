import {createGithubProject, GithubProject, GithubProjectOptions} from "./github/github-project";
import {createNpmPackage, NpmPackage, NpmPackageOptions} from "./npm/npm-package";

export interface Project extends ProjectOptions {
    readonly npmPackage: NpmPackage;
    readonly githubProject: GithubProject;
}

export interface ProjectOptions {
    readonly path: string;
    readonly npmPackage?: NpmPackageOptions;
    readonly githubProject?: GithubProjectOptions;
}

export function createProject(options: ProjectOptions): Project {
    return {
        path: options.path,
        npmPackage: createNpmPackage(options),
        githubProject: createGithubProject(options)
    };
}
