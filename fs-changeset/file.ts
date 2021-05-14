export interface File {
    readonly type: "fs-changeset-file";
    readonly path: string;
}

export interface InternalFile extends File {
    readonly fullPath: string;
    readonly underlyingMTime: bigint | null;
    readonly data: ArrayBufferLike;
}
