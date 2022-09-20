import {basename} from "path";
import type {ProjectOptions} from "../project/project";

export interface NpmPackage extends NpmPackageOptions {
    readonly name: string;
}

export interface NpmPackageOptions {
    readonly name?: string | undefined;
    readonly scope?: string | undefined;
}

export function createNpmPackage(options: ProjectOptions): NpmPackage {
    return {
        name: options.npmPackage?.name ?? defaultName(options),
        scope: options.npmPackage?.scope
    };
}

function defaultName(options: ProjectOptions): string {
    return basename(options.path);
}
