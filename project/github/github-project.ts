import {ProjectOptions} from "../project";

export interface GithubProject extends GithubProjectOptions {
    readonly owner: string;
    readonly name: string;
}

export interface GithubProjectOptions {
    readonly owner?: string;
    readonly name?: string;
}

export function createGithubProject(options: ProjectOptions): GithubProject {
    return {
        owner: options?.githubProject?.owner ?? options?.npmPackage?.scope ?? "softwareventures",
        name: options?.githubProject?.name ?? options?.npmPackage?.name ?? options.path
    };
}
