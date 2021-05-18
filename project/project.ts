import {GitHost, GitHostOptions} from "../git/git-host";
import {NpmPackage, NpmPackageOptions} from "../npm/npm-package";

export interface Project {
    readonly path: string;
    readonly npmPackage: NpmPackage;
    readonly gitHost?: GitHost;
    readonly target: "npm" | "webapp";
    readonly author: {
        readonly name?: string;
        readonly email?: string;
    };
    readonly license: {
        readonly year: number;
        readonly copyrightHolder?: string;
    };
}

export interface ProjectOptions {
    readonly path: string;
    readonly npmPackage?: NpmPackageOptions;
    readonly gitHost?: GitHostOptions;
    readonly target?: "npm" | "webapp";
    readonly author?: {
        readonly name?: string;
        readonly email?: string;
    };
    readonly license?: {
        readonly copyrightHolder?: string;
    };
}

export type ProjectSource = Project | {readonly path: string};
