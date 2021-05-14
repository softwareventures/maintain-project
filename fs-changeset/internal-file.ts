export interface InternalFile {
    readonly type: "fs-changeset-internal-file";
    readonly underlyingMTime: bigint | null;
    readonly data?: ArrayBufferLike;
}

export function internalFile(underlyingMTime: bigint): InternalFile {
    return {type: "fs-changeset-internal-file", underlyingMTime};
}
