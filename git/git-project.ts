import type {Ignore} from "../ignore/ignore.js";

export interface GitProject {
    readonly ignore: Ignore;
}
