import simpleGit from "simple-git";
import {createGitHost, GitHost, GitHostOptions} from "./git/git-host";
import {createIdeaProject} from "./idea/create";
import {IdeaProject} from "./idea/idea-project";
import {createNpmPackage, NpmPackage, NpmPackageOptions} from "./npm/npm-package";
import {guessCopyrightHolder} from "./license/guess-copyright-holder";

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
    readonly ideaProject?: IdeaProject;
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
        .catch(() => undefined);

    const authorEmail = Promise.resolve(options.author?.email)
        .then(email => email ?? git.raw(["config", "user.email"]))
        .catch(() => undefined);

    const ideaProject = createIdeaProject();

    return Promise.all([authorName, authorEmail])
        .then(([authorName, authorEmail]) => ({
            ...options,
            author: {name: authorName, email: authorEmail}
        }))
        .then(async options =>
            ideaProject.then(ideaProject => ({
                path: options.path,
                npmPackage: createNpmPackage(options),
                gitHost: createGitHost(options),
                target: options.target ?? "npm",
                author: options.author,
                license: {
                    year: new Date().getUTCFullYear(),
                    copyrightHolder: guessCopyrightHolder(options)
                },
                ideaProject
            }))
        );
}
