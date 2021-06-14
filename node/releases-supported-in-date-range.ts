import releaseSchedule = require("node-releases/data/release-schedule/release-schedule.json");
import {afterOrEqual, beforeOrEqual, Date, parseIso8601} from "@softwareventures/date";
import chain from "@softwareventures/chain";
import {entries} from "@softwareventures/dictionary";
import {filterFn, mapFn} from "@softwareventures/array";

export interface DateRange {
    readonly start?: Date;
    readonly end?: Date;
}

export function nodeReleasesSupportedInDateRange(dates: DateRange): string[] {
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
                    (dates.start == null || afterOrEqual(end, dates.start)) &&
                    (dates.end == null || beforeOrEqual(start, dates.end))
            )
        )
        .map(mapFn(({version}) => version)).value;
}
