import {Date} from "@softwareventures/date";
import {concatMapFn, filterFn, isArray, mapFn, only} from "@softwareventures/array";
import {intersects} from "semver";
import chain from "@softwareventures/chain";
import {mapNullFn} from "@softwareventures/nullable";
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
import {NodeVersions} from "./node-versions";
import {nodeReleasesSupportedInDateRange} from "./releases-supported-in-date-range";

export type ReadNodeVersionsResult = Result<ReadNodeVersionsFailureReason, NodeVersions>;

export type ReadNodeVersionsFailureReason = ReadJsonFailureReason | ReadYamlFailureReason;

export async function readNodeVersions(
    project: ProjectSource,
    today: Date
): Promise<ReadNodeVersionsResult> {
    const currentReleases = nodeReleasesSupportedInDateRange({start: today, end: today});

    const targetVersions = readProjectJson(project, "package.json")
        .then(mapResultFn(packageJson => packageJson?.engines?.node))
        .then(
            mapResultFn(versions =>
                typeof versions === "string" ? extractMajorNodeVersions(versions, today) : null
            )
        )
        .then(
            bindFailureFn(reasons =>
                only(reasons)?.type === "file-not-found" ? success(null) : failure(reasons)
            )
        )
        .then(mapResultFn(mapNullFn(() => nodeReleasesSupportedInDateRange({end: today}))));

    const testedVersions = readProjectYaml(project, ".github/workflows/ci.yml")
        .then(
            mapResultFn(
                workflow => workflow?.jobs?.["build-and-test"]?.strategy?.matrix?.["node-version"]
            )
        )
        .then(mapResultFn(versions => (typeof versions === "string" ? [versions] : versions)))
        .then(mapResultFn(versions => (isArray(versions) ? versions : [])))
        .then(mapResultFn(mapFn(String)))
        .then(mapResultFn(concatMapFn(version => extractMajorNodeVersions(version, today))))
        .then(
            bindFailureFn(reasons =>
                only(reasons)?.type === "file-not-found" ? success([]) : failure(reasons)
            )
        );

    return allAsyncResults([targetVersions, testedVersions]).then(
        mapResultFn(([targetVersions, testedVersions]) => ({
            targetVersions,
            testedVersions,
            currentReleases
        }))
    );
}

function extractMajorNodeVersions(versions: string, today: Date): string[] {
    return chain(nodeReleasesSupportedInDateRange({end: today})).map(
        filterFn(release => intersects(`^${release}`, versions))
    ).value;
}
