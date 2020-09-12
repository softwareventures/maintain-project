import {createNpmPackage, NpmPackage, NpmPackageOptions} from "./npm/npm-package";

export interface Project extends ProjectOptions {
    readonly npmPackage: NpmPackage;
}

export interface ProjectOptions {
    readonly path: string;
    readonly npmPackage?: NpmPackageOptions;
}

export function createProject(options: ProjectOptions): Project {
    return {
        path: options.path,
        npmPackage: createNpmPackage(options)
    };
}
