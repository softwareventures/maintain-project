import type {Comparison} from "@softwareventures/ordered";
import {compare} from "semver";
import {looseCoerce} from "./loose-coerce";

export function looseCompare(a: string, b: string): Comparison {
    return compare(looseCoerce(a), looseCoerce(b) ?? "0.0.0");
}
