import chain from "@softwareventures/chain";
import {initial, last, mapFn} from "@softwareventures/array";
import {sortByFn} from "../collections/arrays";
import {NodeReleases} from "./node-releases";

export function nodeVersionRange(releases: NodeReleases): string {
    return chain(releases.versions)
        .map(sortByFn(parseFloat))
        .map(mapFn(version => `^${version}`))
        .map(ranges => [...initial(ranges), last(ranges)?.replace(/^\^/, ">=")])
        .map(versions => versions.join(" || ")).value;
}
