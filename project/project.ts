import type {GitHost, GitHostOptions} from "../git/git-host";
import type {NpmPackage, NpmPackageOptions} from "../npm/npm-package";
import type {NodeVersions} from "../node/node-versions";
import type {SpdxLicense} from "../license/spdx/spdx";
import type {GitProject} from "../git/git-project";
import type {TslintProject} from "../tslint/tslint-project";
import type {EslintProject} from "../eslint/eslint-project";

export interface Project {
    readonly path: string;
    readonly npmPackage: NpmPackage;
    readonly git?: GitProject;
    readonly gitHost?: GitHost;
    readonly node: NodeVersions;
    readonly target: "npm" | "webapp";
    readonly tslint?: TslintProject;
    readonly eslint?: EslintProject;
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
