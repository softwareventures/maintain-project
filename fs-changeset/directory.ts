import {FsChangeset} from "./fs-changeset";

export interface Directory {
    readonly type: "fs-changeset-directory";
    readonly fsChangeset: FsChangeset;
    readonly path: string;
}
