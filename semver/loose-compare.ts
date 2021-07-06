import {Comparison} from "@softwareventures/ordered";
import {coerce, compare} from "semver";

export function looseCompare(a: string, b: string): Comparison {
    return compare(coerce(a) ?? "0.0.0", coerce(b) ?? "0.0.0");
}
