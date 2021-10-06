import {basename, dirname, join} from "path";
import {excludeFn, excludeNull, filterFn, mapFn} from "@softwareventures/array";
import {mapNullFn} from "@softwareventures/nullable";
import {ProjectSource} from "../project/project";
import {readProjectText} from "../project/read-text";
import {mapResultFn, toNullable} from "../result/result";
import {splitWhereFn} from "../collections/arrays";
import {readProjectDirectory} from "../project/read-directory";
import {Ignore, ignoreComment, ignoreEntry, IgnoreGroup} from "./ignore";

export async function readProjectIgnore(project: ProjectSource, path: string): Promise<Ignore> {
    const dir = dirname(path);
    const file = basename(path);

    const subdirectories = readProjectDirectory(project, dir)
        .then(filterFn(entry => entry.isDirectory()))
        .then(mapFn(entry => entry.name))
        .then(
            mapFn(async subdirectory =>
                readProjectIgnore(project, join(dir, subdirectory, file)).then(
                    (ignore: Ignore): [string, Ignore] => [subdirectory, ignore]
                )
            )
        )
        .then(async ignores => Promise.all(ignores))
        .then(ignores => new Map<string, Ignore>(ignores));
    const entries = readProjectText(project, path)
        .then(mapResultFn(text => text.split(/\r?\n|\r/)))
        .then(mapResultFn(splitWhereFn(line => /^\s*$/.test(line))))
        .then(mapResultFn(excludeFn(group => group.length === 0)))
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
