import {FsChangeset} from "./fs-changeset";

export interface File {
    readonly type: "fs-changeset-file";
    readonly changeset: FsChangeset;
    readonly path: string;
}
