import {resolve} from "path";
import {excludeFn, excludeNull, filterFn, mapFn} from "@softwareventures/array";
import {mapNullFn} from "@softwareventures/nullable";
import {ProjectSource} from "../../project/project";
import {readProjectText} from "../../project/read-text";
import {mapResultFn, toNullable} from "../../result/result";
import {splitWhereFn} from "../../collections/arrays";
import {readProjectDirectory} from "../../project/read-directory";
import {GitIgnore, gitIgnoreComment, gitIgnoreEntry, GitIgnoreGroup} from "./git-ignore";

export async function readGitIgnore(project: ProjectSource, path = ""): Promise<GitIgnore> {
    const subDirectories = readProjectDirectory(project, path)
        .then(filterFn(entry => entry.isDirectory()))
        .then(mapFn(entry => entry.name))
        .then(mapFn(async subDirectory => readGitIgnore(project, resolve(path, subDirectory))))
        .then(async subDirectories => Promise.all(subDirectories));
    const entries = readProjectText(project, resolve(path, ".gitignore"))
        .then(mapResultFn(text => text.split(/\r?\n|\r/)))
        .then(mapResultFn(splitWhereFn(line => /^\s*$/.test(line))))
        .then(mapResultFn(excludeFn(group => group.length === 0)))
        .then(mapResultFn(mapFn(mapFn(line => /^\s*(?:#\s*(.*)|(.*))\s*$/.exec(line)))))
        .then(mapResultFn(mapFn(excludeNull)))
        .then(
            mapResultFn(
                mapFn(
                    mapFn(([comment, entry]) =>
                        comment == null ? gitIgnoreEntry(entry) : gitIgnoreComment(comment)
                    )
                )
            )
        )
        .then(toNullable)
        .then(mapNullFn((): GitIgnoreGroup[] => []));

    return Promise.all([subDirectories, entries]).then(([subDirectories, entries]) => ({
        path,
        subDirectories,
        entries
    }));
}
