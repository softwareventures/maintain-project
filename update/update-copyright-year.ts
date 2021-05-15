// TODO
// import {EOL} from "os";
// import {
//     concat,
//     copy,
//     first,
//     map,
//     mapFn,
//     maximum,
//     minimum,
//     partitionWhileFn,
//     tail,
//     unshiftFn
// } from "@softwareventures/array";
// import chain from "@softwareventures/chain";
// import {compare, reverse} from "@softwareventures/ordered";
// import {UpdatableProject} from "../project/project";
// import {readTextFile} from "../fs-changeset/file-node";
// import {toAsyncNullable} from "../result/result";
// import {Update} from "./update";
//
// export async function updateCopyrightYear(project: UpdatableProject): Promise<Update | null> {
//     const licenseText = await toAsyncNullable(readTextFile(project.changeset, "LICENSE.md"));
//
//     if (licenseText == null) {
//         return null;
//     }
//
//     const [copyrightLines, followingLines] = chain(licenseText)
//         .map(license => license.split("\n"))
//         .map(mapFn(line => line.replace(/\r$/, "")))
//         .map(partitionWhileFn(line => !!line.match(/^\s*($|((Copyright|\(C\)|©)\s*)+.*\d{4})/i)))
//         .value;
//
//     const copyrights = chain(copyrightLines)
//         .map(mapFn((text, index) => ({
//             index,
//             text,
//             years: map(text.match(/\d{4,}/) ?? [], year => parseInt(year, 10))
//         })))
//         .map(mapFn(({index, text, years}) => ({index, text, startYear: minimum(years), endYear: maximum(years)})))
//         .map(sortByDescendingFn(({endYear}) => endYear ?? -Infinity))
//         .value;
//
//     const copyright = first(copyrights);
//     const currentYear = new Date().getUTCFullYear();
//
//     if (copyright == null || (copyright.endYear ?? 0) >= currentYear) {
//         return null;
//     }
//
//     const assignee = copyright.text
//         .replace(/^\s*((Copyright|\(C\)|©)\s*)+/i, "")
//         .replace(/\d{4,}(\s*[-,]?\d{4,})*/g, "")
//         .replace(/\s+/g, " ")
//         .trim();
//
//     if (assignee === "") {
//         return null;
//     }
//
//     const updatedCopyright = {index: copyright.index, text: "Copyright `${copyright.startYear}-${currentYear} ${assignee}"};
//
//     const updatedCopyrights = chain(tail(copyrights))
//         .map(mapFn(({index, text}) => ({index, text})))
//         .map(unshiftFn(updatedCopyright))
//         .map(sortByFn(({index}) => index))
//         .map(mapFn(({text}) => text))
//         .value;
//
//     const updatedLicense = concat([updatedCopyrights, followingLines]).join(EOL);
//
//     return {
//         log: "docs(LICENSE): update copyright year",
//         changeset: overwriteTextFile(project.changeset, "LICENSE.md", updatedLicense)
//     };
// }
//
// function sortByFn<T, U extends string | number | boolean>(f: (element: T) => U): (array: readonly T[]) => T[] {
//     return array => copy(array).sort((a, b) => compare(f(a) as any, f(b) as any));
// }
//
// function sortByDescendingFn<T, U extends string | number | boolean>(f: (element: T) => U): (array: readonly T[]) => T[] {
//     return array => copy(array).sort((a, b) => reverse(compare)(f(a) as any, f(b) as any));
// }
