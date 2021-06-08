import {EOL} from "os";
import chain from "@softwareventures/chain";
import {
    concat,
    first,
    map,
    mapFn,
    maximum,
    minimum,
    partitionWhile,
    partitionWhileFn,
    tail,
    unshiftFn
} from "@softwareventures/array";
import {mapNullableFn} from "@softwareventures/nullable";
import {Project} from "../project/project";
import {insert} from "../fs-stage/fs-stage";
import {readProjectText} from "../project/read-text";
import {textFile} from "../fs-stage/file";
import {sortByDescendingFn, sortByFn} from "../collections/arrays";
import {Update} from "../project/update";

export async function updateCopyrightYear(project: Project): Promise<Update | null> {
    const text = readProjectText(project, "LICENSE.md").catch(reason => {
        if (reason.code === "ENOENT") {
            return null;
        } else {
            throw reason;
        }
    });

    const copyrightLineRegExp = /^\s*($|((Copyright|\(C\)|©)\s*)+.*\d{4})/i;

    const newText = text.then(
        mapNullableFn(text => {
            const [titleLines, copyrightLines, followingLines] = chain(text)
                .map(license => license.split("\n"))
                .map(mapFn(line => line.replace(/\r$/, "")))
                .map(partitionWhileFn(line => !line.match(copyrightLineRegExp)))
                .map(([titleLines, followingLines]) => [
                    titleLines,
                    ...partitionWhile(followingLines, line => !!line.match(copyrightLineRegExp))
                ]).value;

            const copyrights = chain(copyrightLines)
                .map(
                    mapFn((text, index) => ({
                        index,
                        text,
                        years: map(text.match(/\d{4,}/g) ?? [], year => parseInt(year, 10))
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
                .replace(/^\s*((Copyright|\(C\)|©)\s*)+/i, "")
                .replace(/\d{4,}(\s*[-,]?\d{4,})*/g, "")
                .replace(/\s+/g, " ")
                .trim();

            if (assignee === "") {
                return null;
            }

            const updatedCopyright = {
                index: copyright.index,
                text: `Copyright ${
                    copyright.startYear ? `${copyright.startYear}-` : ""
                }${currentYear} ${assignee}`
            };

            const updatedCopyrightLines = chain(tail(copyrights))
                .map(mapFn(({index, text}) => ({index, text})))
                .map(unshiftFn(updatedCopyright))
                .map(sortByFn(({index}) => index))
                .map(mapFn(({text}) => text)).value;

            return concat([titleLines, updatedCopyrightLines, followingLines]).join(EOL);
        })
    );

    const file = newText.then(mapNullableFn(textFile));

    return file.then(file =>
        file == null
            ? null
            : {
                  log: "docs(LICENSE): update copyright year",
                  apply: stage => insert(stage, "LICENSE.md", file)
              }
    );
}
