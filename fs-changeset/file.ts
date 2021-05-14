import {FsChangeset} from "./fs-changeset";

export interface File {
    readonly type: "fs-changeset-file";
    readonly changeset: FsChangeset;
    readonly path: string;
}

export interface InternalFile {
    readonly type: "fs-changeset-internal-file";
    readonly underlyingMTime: bigint | null;
    readonly data: ArrayBufferLike;
}
