import {ltr} from "semver";
import {looseCoerce} from "./loose-coerce";

export function looseLtr(version: string, range: string): boolean {
    return ltr(looseCoerce(version), range);
}
