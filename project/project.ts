import {createGitHost, GitHost, GitHostOptions} from "./git/git-host";
import {createNpmPackage, NpmPackage, NpmPackageOptions} from "./npm/npm-package";

export interface Project {
    readonly path: string;
    readonly npmPackage: NpmPackage;
    readonly gitHost?: GitHost;
    readonly target: "npm" | "webapp";
}

export interface ProjectOptions {
    readonly path: string;
    readonly npmPackage?: NpmPackageOptions;
    readonly gitHost?: GitHostOptions;
    readonly target?: "npm" | "webapp";
}

export function createProject(options: ProjectOptions): Project {
    return {
        path: options.path,
        npmPackage: createNpmPackage(options),
        gitHost: createGitHost(options),
        target: options.target ?? "npm"
    };
}
