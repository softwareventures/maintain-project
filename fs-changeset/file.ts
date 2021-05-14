export interface File {
    readonly type: "fs-changeset-file";
    readonly path: string;
    readonly data: ArrayBufferLike;
}

export interface InternalFile extends File {
    readonly fullPath: string;
    readonly underlyingMTime: bigint | null;
}

export function file(path: string, data: ArrayBufferLike): File {
    return {type: "fs-changeset-file", path, data};
}
