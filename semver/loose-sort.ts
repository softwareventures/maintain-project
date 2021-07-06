import {sort} from "../collections/arrays";
import {looseCompare} from "./loose-compare";

export function looseSort(versions: readonly string[]): string[] {
    return sort(versions, looseCompare);
}
