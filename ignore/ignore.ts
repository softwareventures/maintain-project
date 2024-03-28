import {posix} from "path";
import {concat, first, foldFn, mapFn, tail} from "@softwareventures/array";
import {chain} from "@softwareventures/chain";
import {mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import picomatch from "picomatch";

export interface Ignore {
    readonly subdirectories: ReadonlyMap<string, Ignore>;
    readonly entries: readonly IgnoreGroup[];
}

export type IgnoreGroup = readonly IgnoreLine[];

export type IgnoreLine = IgnoreComment | IgnoreEntry;

export interface IgnoreComment {
    readonly type: "ignore-comment";
    readonly text: string;
}

export interface IgnoreEntry {
    readonly type: "ignore-entry";
    readonly text: string;
}

export function ignoreComment(text: string): IgnoreComment {
    return {type: "ignore-comment", text};
}

export function ignoreEntry(text: string): IgnoreEntry {
    return {type: "ignore-entry", text};
}

export type IgnoreStatus = "ignored" | "explicitly-not-ignored" | "not-ignored";

export function isIgnored(ignore: Ignore, path: string): IgnoreStatus {
    return isIgnoredInternal(ignore, posix.normalize(path).split(posix.sep));
}

function isIgnoredInternal(ignore: Ignore, segments: readonly string[]): IgnoreStatus {
    if (first(segments) === "..") {
        return "not-ignored";
    }

    const subdirectoryStatus = chain(first(segments))
        .map(mapNullableFn(dir => ignore.subdirectories.get(dir)))
        .map(mapNullableFn(ignore => isIgnoredInternal(ignore, tail(segments))))
        .map(mapNullFn((): IgnoreStatus => "not-ignored")).value;

    if (subdirectoryStatus !== "not-ignored") {
        return subdirectoryStatus;
    }

    const path = posix.join(...segments);

    return chain(ignore.entries)
        .map(concat)
        .map(mapFn(line => isIgnoredByLine(line, path)))
        .map(
            foldFn<IgnoreStatus, IgnoreStatus>(
                (status, lineStatus) => (lineStatus === "not-ignored" ? status : lineStatus),
                "not-ignored"
            )
        ).value;
}

function isIgnoredByLine(line: IgnoreLine, path: string): IgnoreStatus {
    if (line.type !== "ignore-entry") {
        return "not-ignored";
    }

    const text = line.text.trim();
    const negate = line.text.startsWith("!");
    const matcher = picomatch(text.replace(/^!/u, "").trim(), {
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
