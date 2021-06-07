import chain from "@softwareventures/chain";
import {initial, last, mapFn} from "@softwareventures/array";
import {sortByFn} from "../collections/arrays";

export function nodeVersionRange(versions: readonly string[]): string {
    return chain(versions)
        .map(sortByFn(parseFloat))
        .map(mapFn(version => `^${version}`))
        .map(ranges => [...initial(ranges), last(ranges)?.replace(/^\^/, ">=")])
        .map(versions => versions.join(" || ")).value;
}
