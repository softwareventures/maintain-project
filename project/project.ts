import simpleGit from "simple-git";
import {createGitHost, GitHost, GitHostOptions} from "../git/git-host";
import {createNpmPackage, NpmPackage, NpmPackageOptions} from "../npm/npm-package";
import {guessCopyrightHolder} from "../license/guess-copyright-holder";

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

export async function createProject(options: ProjectOptions): Promise<Project> {
    const git = simpleGit();

    const authorName = Promise.resolve(options.author?.name)
        .then(name => name ?? git.raw(["config", "user.name"]))
        .then(name => name?.trim())
        .catch(() => undefined);

    const authorEmail = Promise.resolve(options.author?.email)
        .then(email => email ?? git.raw(["config", "user.email"]))
        .then(email => email?.trim())
        .catch(() => undefined);

    return Promise.all([authorName, authorEmail])
        .then(([authorName, authorEmail]) => ({
            ...options,
            author: {name: authorName, email: authorEmail}
        }))
        .then(options => ({
            path: options.path,
            npmPackage: createNpmPackage(options),
            gitHost: createGitHost(options),
            target: options.target ?? "npm",
            author: options.author,
            license: {
                year: new Date().getUTCFullYear(),
                copyrightHolder: guessCopyrightHolder(options)
            }
        }));
}
