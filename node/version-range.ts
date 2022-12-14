import {chain} from "@softwareventures/chain";
import {initial, last, mapFn} from "@softwareventures/array";
import {looseSort} from "../semver/loose-sort";

export function nodeVersionRange(versions: readonly string[]): string {
    return chain(versions)
        .map(looseSort)
        .map(mapFn(version => `^${version}`))
        .map(ranges => [...initial(ranges), last(ranges)?.replace(/^\^/u, ">=")])
        .map(versions => versions.join(" || ")).value;
}
