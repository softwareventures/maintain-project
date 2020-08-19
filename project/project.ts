import {basename} from "path";

export interface Project extends ProjectOptions {
    readonly packageName: string;
    readonly npmScope: string;
}

export interface ProjectOptions {
    readonly path: string;
    readonly npmScope?: string;
    readonly packageName?: string;
}

export function createProject(options: ProjectOptions): Project {
    return {
        path: options.path,
        npmScope: options.npmScope ?? "softwareventures",
        packageName: options.packageName ?? defaultPackageName(options)
    };
}

function defaultPackageName(options: ProjectOptions): string {
    return basename(options.path);
}
