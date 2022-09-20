import type {SemVer} from "semver";
import {coerce, parse} from "semver";
import {notNull} from "@softwareventures/nullable";

const zero = notNull(parse("0.0.0"));

export function looseCoerce(version: string): SemVer {
    return coerce(version) ?? zero;
}
