import {createNpmPackage, NpmPackage} from "./npm/npm-package";

export interface Project extends ProjectOptions {
    readonly npmPackage: NpmPackage;
}

export interface ProjectOptions {
    readonly path: string;
    readonly npmPackage?: NpmPackage;
}

export function createProject(options: ProjectOptions): Project {
    return {
        path: options.path,
        npmPackage: createNpmPackage(options)
    };
}
