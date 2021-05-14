export interface InternalSpecialFile {
    readonly type: "fs-changeset-internal-special-file";
    readonly underlyingMTime: bigint;
}

export function internalSpecialFile(underlyingMTime: bigint): InternalSpecialFile {
    return {type: "fs-changeset-internal-special-file", underlyingMTime};
}
