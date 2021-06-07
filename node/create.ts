import releaseSchedule = require("node-releases/data/release-schedule/release-schedule.json");
import {entries} from "@softwareventures/dictionary";
import chain from "@softwareventures/chain";
import {parseIso8601, Date, beforeOrEqual, afterOrEqual} from "@softwareventures/date";
import {filterFn, mapFn} from "@softwareventures/array";
import {NodeVersions} from "./node-versions";

export function createNodeVersions(today: Date): NodeVersions {
    return chain(entries(releaseSchedule))
        .map(
            mapFn(([version, {start, end}]) => ({
                version: version.replace(/^v/, ""),
                start: parseIso8601(start),
                end: parseIso8601(end)
            }))
        )
        .map(
            filterFn(
                ({start, end}) =>
                    start != null &&
                    end != null &&
                    beforeOrEqual(start, today) &&
                    afterOrEqual(end, today)
            )
        )
        .map(mapFn(({version}) => version))
        .map(currentReleases => ({targetVersions: currentReleases, currentReleases})).value;
}
