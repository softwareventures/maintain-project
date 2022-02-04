import simpleGit from "simple-git";
import {todayUtc} from "@softwareventures/date";
import {createNpmPackage} from "../npm/npm-package";
import {createGitHost} from "../git/git-host";
import {guessCopyrightHolder} from "../license/guess-copyright-holder";
import {createNodeVersions} from "../node/create";
import {createGitProject} from "../git/create";
import {Project, ProjectOptions} from "./project";

export async function createProject(options: ProjectOptions): Promise<Project> {
    const git = simpleGit();

    const protoProject = {
        path: options.path,
        target: options.target ?? "npm"
    };

    const gitProject = createGitProject(protoProject);

    const authorName = Promise.resolve(options.author?.name)
        .then(name => name ?? git.raw(["config", "user.name"]))
        .then(name => name?.trim())
        .catch(() => undefined);

    const authorEmail = Promise.resolve(options.author?.email)
        .then(email => email ?? git.raw(["config", "user.email"]))
        .then(email => email?.trim())
        .catch(() => undefined);

    const today = todayUtc();

    return Promise.all([gitProject, authorName, authorEmail])
        .then(([gitProject, authorName, authorEmail]) => ({
            ...options,
            ...protoProject,
            gitProject,
            author: {name: authorName, email: authorEmail}
        }))
        .then(options => ({
            path: options.path,
            npmPackage: createNpmPackage(options),
            gitProject: options.gitProject,
            gitHost: createGitHost(options),
            node: createNodeVersions(today),
            target: options.target,
            eslint: {preset: "softwareventures"},
            author: options.author,
            license: {
                spdxLicense: options.license?.spdxLicense,
                year: today.year,
                copyrightHolder: guessCopyrightHolder(options)
            }
        }));
}
