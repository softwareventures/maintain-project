import {basename, dirname, join} from "path";
import {Dirent} from "fs";
import {excludeNull, filterFn, mapFn} from "@softwareventures/array";
import {mapNullFn} from "@softwareventures/nullable";
import {ReadTextResult} from "../project/read-text";
import {mapResultFn, toNullable} from "../result/result";
import {splitWhereFn} from "../collections/arrays";
import {Ignore, ignoreComment, ignoreEntry, IgnoreGroup} from "./ignore";

export interface ReadIgnoreOptions {
    path: string;
    readDirectory: (path: string) => Promise<readonly Dirent[]>;
    readText: (path: string) => Promise<ReadTextResult>;
}

export async function readIgnore({
    path,
    readDirectory,
    readText
}: ReadIgnoreOptions): Promise<Ignore> {
    const dir = dirname(path);
    const file = basename(path);

    const subdirectories = readDirectory(dir)
        .then(filterFn(entry => entry.isDirectory()))
        .then(mapFn(entry => entry.name))
        .then(
            mapFn(async subdirectory =>
                readIgnore({path: join(dir, subdirectory, file), readDirectory, readText}).then(
                    (ignore: Ignore): [string, Ignore] => [subdirectory, ignore]
                )
            )
        )
        .then(async ignores => Promise.all(ignores))
        .then(ignores => new Map<string, Ignore>(ignores));

    const entries = readText(path)
        .then(mapResultFn(text => text.split(/\r?\n|\r/)))
        .then(mapResultFn(splitWhereFn(line => /^\s*$/.test(line))))
        .then(mapResultFn(mapFn(mapFn(line => /^\s*(?:#\s*(.*)|(.*))\s*$/.exec(line)))))
        .then(mapResultFn(mapFn(excludeNull)))
        .then(
            mapResultFn(
                mapFn(
                    mapFn(([comment, entry]) =>
                        comment == null ? ignoreEntry(entry) : ignoreComment(comment)
                    )
                )
            )
        )
        .then(toNullable)
        .then(mapNullFn((): IgnoreGroup[] => []));

    return Promise.all([subdirectories, entries]).then(([subdirectories, entries]) => ({
        subdirectories,
        entries
    }));
}
