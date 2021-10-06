import {posix} from "path";
import {concat, first, foldFn, mapFn, tail} from "@softwareventures/array";
import chain from "@softwareventures/chain";
import {mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import picomatch = require("picomatch");

export interface GitIgnore {
    readonly subdirectories: ReadonlyMap<string, GitIgnore>;
    readonly entries: readonly GitIgnoreGroup[];
}

export type GitIgnoreGroup = readonly GitIgnoreLine[];

export type GitIgnoreLine = GitIgnoreComment | GitIgnoreEntry;

export interface GitIgnoreComment {
    readonly type: "git-ignore-comment";
    readonly text: string;
}

export interface GitIgnoreEntry {
    readonly type: "git-ignore-entry";
    readonly text: string;
}

export function gitIgnoreComment(text: string): GitIgnoreComment {
    return {type: "git-ignore-comment", text};
}

export function gitIgnoreEntry(text: string): GitIgnoreEntry {
    return {type: "git-ignore-entry", text};
}

export type GitIgnoreStatus = "ignored" | "explicitly-not-ignored" | "not-ignored";

export function isGitIgnored(ignore: GitIgnore, path: string): GitIgnoreStatus {
    return isGitIgnoredInternal(ignore, posix.normalize(path).split(posix.sep));
}

function isGitIgnoredInternal(ignore: GitIgnore, segments: readonly string[]): GitIgnoreStatus {
    if (first(segments) === "..") {
        return "not-ignored";
    }

    const subdirectoryStatus = chain(first(segments))
        .map(mapNullableFn(dir => ignore.subdirectories.get(dir)))
        .map(mapNullableFn(ignore => isGitIgnoredInternal(ignore, tail(segments))))
        .map(mapNullFn((): GitIgnoreStatus => "not-ignored")).value;

    if (subdirectoryStatus !== "not-ignored") {
        return subdirectoryStatus;
    }

    const path = posix.join(...segments);

    return chain(ignore.entries)
        .map(concat)
        .map(mapFn(line => isGitIgnoredByLine(line, path)))
        .map(
            foldFn<GitIgnoreStatus, GitIgnoreStatus>(
                (status, lineStatus) => (lineStatus === "not-ignored" ? status : lineStatus),
                "not-ignored"
            )
        ).value;
}

function isGitIgnoredByLine(line: GitIgnoreLine, path: string): GitIgnoreStatus {
    if (line.type !== "git-ignore-entry") {
        return "not-ignored";
    }

    const text = line.text.trim();
    const negate = line.text.charAt(0) === "!";
    const matcher = picomatch(text.replace(/^!/, "").trim(), {
        basename: true,
        posix: false,
        dot: true,
        nobrace: true,
        noextglob: true,
        nonegate: true,
        noquantifiers: true,
        strictSlashes: true
    });

    if (!matcher(path)) {
        return "not-ignored";
    } else if (negate) {
        return "explicitly-not-ignored";
    } else {
        return "ignored";
    }
}
