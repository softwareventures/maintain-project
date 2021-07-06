import {coerce, ltr} from "semver";

export function looseLtr(version: string, range: string): boolean {
    return ltr(coerce(version) ?? "0.0.0", range);
}
