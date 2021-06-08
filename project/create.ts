import simpleGit from "simple-git";
import {todayUtc} from "@softwareventures/date";
import {createNpmPackage} from "../npm/npm-package";
import {createGitHost} from "../git/git-host";
import {guessCopyrightHolder} from "../license/guess-copyright-holder";
import {createNodeVersions} from "../node/create";
import {Project, ProjectOptions} from "./project";

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

    const today = todayUtc();

    return Promise.all([authorName, authorEmail])
        .then(([authorName, authorEmail]) => ({
            ...options,
            author: {name: authorName, email: authorEmail}
        }))
        .then(options => ({
            path: options.path,
            npmPackage: createNpmPackage(options),
            gitHost: createGitHost(options),
            node: createNodeVersions(today),
            target: options.target ?? "npm",
            author: options.author,
            license: {
                spdxLicense: options.license?.spdxLicense,
                year: today.year,
                copyrightHolder: guessCopyrightHolder(options)
            }
        }));
}
