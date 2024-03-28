import {basename} from "path";
import HostedGitInfo from "hosted-git-info";
import type {ProjectOptions} from "../project/project.js";

export type GitHost = GitHubHost | UnknownGitHost;

export interface GitHubHost {
    readonly service: "github";
    readonly user: string;
    readonly project: string;
}

export interface UnknownGitHost {
    readonly service: "unknown";
    readonly url: string;
}

export interface GitHostOptions {
    readonly user?: string | undefined;
    readonly project?: string | undefined;
}

export function createGitHost(options: ProjectOptions): GitHost {
    return {
        service: "github",
        user: options?.gitHost?.user ?? options?.npmPackage?.scope ?? "softwareventures",
        project: options?.gitHost?.project ?? options?.npmPackage?.name ?? basename(options.path)
    };
}

export function gitHostFromUrl(url: string): GitHost | undefined {
    const info = HostedGitInfo.fromUrl(url);
    if (info?.type === "github") {
        return {
            service: "github",
            user: info.user,
            project: info.project
        };
    } else {
        return {
            service: "unknown",
            url
        };
    }
}

function hostedGitInfo(gitHost: GitHost): HostedGitInfo | undefined {
    return gitHost.service === "github"
        ? new HostedGitInfo("github", gitHost.user, undefined, gitHost.project)
        : undefined;
}

export function homepageUrl(gitHost: GitHost): string | undefined {
    return hostedGitInfo(gitHost)?.browse();
}

export function bugsUrl(gitHost: GitHost): string | undefined {
    return hostedGitInfo(gitHost)?.bugs();
}

export function repositoryShortcut(gitHost: GitHost): string | undefined {
    return hostedGitInfo(gitHost)?.shortcut();
}
