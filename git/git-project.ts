import type {Ignore} from "../ignore/ignore";

export interface GitProject {
    readonly ignore: Ignore;
}
