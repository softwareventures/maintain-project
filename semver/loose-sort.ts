import {sort} from "@softwareventures/array";
import {looseCompare} from "./loose-compare.js";

export function looseSort(versions: readonly string[]): string[] {
    return sort(versions, looseCompare);
}
