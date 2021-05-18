import releaseSchedule = require("node-releases/data/release-schedule/release-schedule.json");
import {entries} from "@softwareventures/dictionary";
import chain from "@softwareventures/chain";
import {parseIso8601, Date, beforeOrEqual, afterOrEqual} from "@softwareventures/date";
import {filterFn, mapFn} from "@softwareventures/array";
import {NodeReleases} from "./node-releases";

export function createNodeReleases(today: Date): NodeReleases {
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
        .map(versions => ({versions})).value;
}
