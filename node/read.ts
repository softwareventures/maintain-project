import {Date} from "@softwareventures/date";
import {
    concat,
    concatMapFn,
    filterFn,
    isArray,
    mapFn,
    uniqueAdjacentByIdentity
} from "@softwareventures/array";
import {coerce, compare, intersects} from "semver";
import chain from "@softwareventures/chain";
import {ProjectSource} from "../project/project";
import {ReadJsonFailureReason, readProjectJson} from "../project/read-json";
import {
    allAsyncResults,
    bindFailureFn,
    failure,
    mapResultFn,
    Result,
    success
} from "../result/result";
import {readProjectYaml, ReadYamlFailureReason} from "../project/read-yaml";
import {only, sortFn} from "../collections/arrays";
import {NodeVersions} from "./node-versions";
import {nodeReleasesSupportedInDateRange} from "./releases-supported-in-date-range";

export type ReadNodeVersionsResult = Result<ReadNodeVersionsFailureReason, NodeVersions>;

export type ReadNodeVersionsFailureReason = ReadJsonFailureReason | ReadYamlFailureReason;

export async function readNodeVersions(
    project: ProjectSource,
    today: Date
): Promise<ReadNodeVersionsResult> {
    const currentReleases = nodeReleasesSupportedInDateRange({start: today, end: today});

    const packageJsonNodeVersions = readProjectJson(project, "package.json")
        .then(mapResultFn(packageJson => packageJson?.engines?.node))
        .then(
            mapResultFn(versions =>
                typeof versions === "string" ? extractMajorNodeVersions(versions, today) : []
            )
        )
        .then(
            bindFailureFn(reasons =>
                only(reasons)?.type === "file-not-found" ? success([]) : failure(reasons)
            )
        );

    const ciWorkflowNodeVersions = readProjectYaml(project, ".github/workflows/ci.yml")
        .then(
            mapResultFn(
                workflow => workflow?.jobs?.["build-and-test"]?.strategy?.matrix?.["node-version"]
            )
        )
        .then(mapResultFn(versions => (isArray(versions) ? versions : [])))
        .then(mapResultFn(mapFn(String)))
        .then(mapResultFn(concatMapFn(version => extractMajorNodeVersions(version, today))))
        .then(
            bindFailureFn(reasons =>
                only(reasons)?.type === "file-not-found" ? success([]) : failure(reasons)
            )
        );

    const targetVersions = allAsyncResults([packageJsonNodeVersions, ciWorkflowNodeVersions])
        .then(mapResultFn(concat))
        .then(mapResultFn(sortFn((a, b) => compare(coerce(a) ?? "0.0.0", coerce(b) ?? "0.0.0"))))
        .then(mapResultFn(uniqueAdjacentByIdentity));

    return targetVersions.then(mapResultFn(targetVersions => ({currentReleases, targetVersions})));
}

function extractMajorNodeVersions(versions: string, today: Date): string[] {
    return chain(nodeReleasesSupportedInDateRange({end: today})).map(
        filterFn(release => intersects(`^${release}`, versions))
    ).value;
}
