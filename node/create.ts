import type {Date} from "@softwareventures/date";
import type {NodeVersions} from "./node-versions.js";
import {nodeReleasesSupportedInDateRange} from "./releases-supported-in-date-range.js";

export function createNodeVersions(today: Date): NodeVersions {
    const currentReleases = nodeReleasesSupportedInDateRange({start: today, end: today});
    return {targetVersions: currentReleases, testedVersions: currentReleases, currentReleases};
}
