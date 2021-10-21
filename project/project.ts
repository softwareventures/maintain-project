import {GitHost, GitHostOptions} from "../git/git-host";
import {NpmPackage, NpmPackageOptions} from "../npm/npm-package";
import {NodeVersions} from "../node/node-versions";
import {SpdxLicense} from "../license/spdx/spdx";
import {GitProject} from "../git/git-project";
import {TslintProject} from "../tslint/tslint-project";

export interface Project {
    readonly path: string;
    readonly npmPackage: NpmPackage;
    readonly git?: GitProject;
    readonly gitHost?: GitHost;
    readonly node: NodeVersions;
    readonly target: "npm" | "webapp";
    readonly tslint?: TslintProject;
    readonly author: {
        readonly name?: string;
        readonly email?: string;
    };
    readonly license: {
        readonly spdxLicense?: SpdxLicense;
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
        readonly spdxLicense?: SpdxLicense;
        readonly copyrightHolder?: string;
    };
}

export type ProjectSource = Project | {readonly path: string};
