import chain from "@softwareventures/chain";
import {initial, last, mapFn} from "@softwareventures/array";
import {coerce, compare} from "semver";
import {sortFn} from "../collections/arrays";

export function nodeVersionRange(versions: readonly string[]): string {
    return chain(versions)
        .map(sortFn<string>((a, b) => compare(coerce(a) ?? "0.0.0", coerce(b) ?? "0.0.0")))
        .map(mapFn(version => `^${version}`))
        .map(ranges => [...initial(ranges), last(ranges)?.replace(/^\^/, ">=")])
        .map(versions => versions.join(" || ")).value;
}
