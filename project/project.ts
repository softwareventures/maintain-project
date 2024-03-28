import type {GitHost, GitHostOptions} from "../git/git-host.js";
import type {NpmPackage, NpmPackageOptions} from "../npm/npm-package.js";
import type {NodeVersions} from "../node/node-versions.js";
import type {SpdxLicense} from "../license/spdx/spdx.js";
import type {GitProject} from "../git/git-project.js";
import type {TslintProject} from "../tslint/tslint-project.js";
import type {EslintProject} from "../eslint/eslint-project.js";

export interface Project {
    readonly path: string;
    readonly npmPackage: NpmPackage;
    readonly git?: GitProject | undefined;
    readonly gitHost?: GitHost | undefined;
    readonly node: NodeVersions;
    readonly target: "npm" | "webapp";
    readonly tslint?: TslintProject | undefined;
    readonly eslint?: EslintProject | undefined;
    readonly author: {
        readonly name?: string | undefined;
        readonly email?: string | undefined;
    };
    readonly license: {
        readonly spdxLicense?: SpdxLicense | undefined;
        readonly year: number;
        readonly copyrightHolder?: string | undefined;
    };
}

export interface ProjectOptions {
    readonly path: string;
    readonly npmPackage?: NpmPackageOptions | undefined;
    readonly gitHost?: GitHostOptions | undefined;
    readonly target?: "npm" | "webapp" | undefined;
    readonly author?:
        | undefined
        | {
              readonly name?: string | undefined;
              readonly email?: string | undefined;
          };
    readonly license?:
        | undefined
        | {
              readonly spdxLicense?: SpdxLicense | undefined;
              readonly copyrightHolder?: string | undefined;
          };
}

export type ProjectSource = Project | {readonly path: string};
