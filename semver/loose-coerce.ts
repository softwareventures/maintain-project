import {coerce, parse, SemVer} from "semver";

const zero = parse("0.0.0") as SemVer;

export function looseCoerce(version: string): SemVer {
    return coerce(version) ?? zero;
}
