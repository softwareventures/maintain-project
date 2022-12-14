import {EOL} from "os";
import {chain} from "@softwareventures/chain";
import {
    concat,
    first,
    map,
    mapFn,
    maximum,
    minimum,
    partitionWhile,
    partitionWhileFn,
    sortByDescendingFn,
    sortByFn,
    tail,
    unshiftFn
} from "@softwareventures/array";
import {mapNullableFn} from "@softwareventures/nullable";
import type {Project} from "../project/project";
import type {FsStage} from "../fs-stage/fs-stage";
import {insert} from "../fs-stage/fs-stage";
import {readProjectText} from "../project/read-text";
import {textFile} from "../fs-stage/file";
import type {Update} from "../project/update";
import {chainAsyncResultsFn, toNullable} from "../result/result";
import {asyncExcludeNull, asyncMapFn, combineAsync} from "../collections/async-iterable";

export async function updateCopyrightYear(project: Project): Promise<Update | null> {
    const copyrightLineRegExp = /^\s*($|((Copyright|\(C\)|©)\s*)+.*\d{4})/iu;

    return chain(["LICENSE.md", "LICENSE.txt", "LICENSE"])
        .map(
            mapFn(async filename =>
                readProjectText(project, filename)
                    .then(toNullable)
                    .then(mapNullableFn(text => ({filename, text})))
            )
        )
        .map(asyncExcludeNull)
        .map(
            asyncMapFn(({filename, text}) => {
                const [titleLines, copyrightLines, followingLines] = chain(text)
                    .map(license => license.split("\n"))
                    .map(mapFn(line => line.replace(/\r$/u, "")))
                    .map(partitionWhileFn(line => line.match(copyrightLineRegExp) == null))
                    .map(
                        ([titleLines, followingLines]) =>
                            [
                                titleLines,
                                ...partitionWhile(followingLines, line =>
                                    Boolean(line.match(copyrightLineRegExp))
                                )
                            ] as const
                    ).value;

                const copyrights = chain(copyrightLines)
                    .map(
                        mapFn((text, index) => ({
                            index,
                            text,
                            years: map(text.match(/\d{4,}/gu) ?? [], year => parseInt(year, 10))
                        }))
                    )
                    .map(
                        mapFn(({index, text, years}) => ({
                            index,
                            text,
                            startYear: minimum(years),
                            endYear: maximum(years)
                        }))
                    )
                    .map(sortByDescendingFn(({endYear}) => endYear ?? -Infinity)).value;

                const copyright = first(copyrights);
                const currentYear = project.license.year;

                if (copyright == null || (copyright.endYear ?? 0) >= currentYear) {
                    return null;
                }

                const assignee = copyright.text
                    .replace(/^\s*((Copyright|\(C\)|©)\s*)+/iu, "")
                    .replace(/\d{4,}(\s*[-,]?\s*\d{4,})*/gu, "")
                    .replace(/\s+/gu, " ")
                    .trim();

                if (assignee === "") {
                    return null;
                }

                const updatedCopyright = {
                    index: copyright.index,
                    text: `Copyright ${
                        copyright.startYear == null ? "" : `${copyright.startYear}-`
                    }${currentYear} ${assignee}`
                };

                const updatedCopyrightLines = chain(tail(copyrights))
                    .map(mapFn(({index, text}) => ({index, text})))
                    .map(unshiftFn(updatedCopyright))
                    .map(sortByFn(({index}) => index))
                    .map(mapFn(({text}) => text)).value;

                return {
                    filename,
                    text: concat([titleLines, updatedCopyrightLines, followingLines]).join(EOL)
                };
            })
        )
        .map(asyncExcludeNull)
        .map(asyncMapFn(({filename, text}) => ({filename, file: textFile(text)})))
        .map(
            asyncMapFn(
                ({filename, file}) =>
                    async (stage: FsStage) =>
                        insert(stage, filename, file)
            )
        )
        .map(combineAsync)
        .value.then(insertions => (insertions.length === 0 ? null : insertions))
        .then(
            mapNullableFn(insertions => ({
                type: "fs-stage-update",
                log: "docs(license): update copyright year",
                apply: chainAsyncResultsFn(insertions)
            }))
        );
}
