import type {Dirent} from "fs";
import {excludeNull, filterFn, mapFn} from "@softwareventures/array";
import {mapNullFn, notNull} from "@softwareventures/nullable";
import type {ReadTextResult} from "../project/read-text.js";
import {mapResultFn, toNullable} from "../result/result.js";
import {splitWhereFn} from "../collections/arrays.js";
import type {Ignore, IgnoreGroup} from "./ignore.js";
import {ignoreComment, ignoreEntry} from "./ignore.js";

export interface ReadIgnoreOptions {
    path: string;
    dirname: (path: string) => string;
    basename: (path: string) => string;
    join: (...paths: string[]) => string;
    readDirectory: (path: string) => Promise<readonly Dirent[]>;
    readText: (path: string) => Promise<ReadTextResult>;
}

export async function readIgnore({
    path,
    dirname,
    basename,
    join,
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
                readIgnore({
                    path: join(dir, subdirectory, file),
                    dirname,
                    basename,
                    join,
                    readDirectory,
                    readText
                }).then((ignore: Ignore): [string, Ignore] => [subdirectory, ignore])
            )
        )
        .then(async ignores => Promise.all(ignores))
        .then(ignores => new Map<string, Ignore>(ignores));

    const entries = readText(path)
        .then(mapResultFn(text => text.split(/\r?\n|\r/u)))
        .then(mapResultFn(splitWhereFn(line => /^\s*$/u.test(line))))
        .then(mapResultFn(mapFn(mapFn(line => /^\s*(?:#\s*(.*)|(.*))\s*$/u.exec(line)))))
        .then(mapResultFn(mapFn(excludeNull)))
        .then(
            mapResultFn(
                mapFn(
                    mapFn(([comment, entry]) =>
                        comment == null ? ignoreEntry(notNull(entry)) : ignoreComment(comment)
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
