import {TextFile} from "./text-file";

export interface Directory {
    readonly type: "directory";
    readonly entries: ReadonlyMap<string, Directory | TextFile>;
}
