import {lt} from "semver";
import {looseCoerce} from "./loose-coerce";

export function looseLt(v1: string, v2: string): boolean {
    return lt(looseCoerce(v1), looseCoerce(v2));
}
