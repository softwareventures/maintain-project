export interface File {
    readonly type: "file";
    readonly data: ArrayBufferLike;
}

export function textFile(text: string): File {
    return {type: "file", data: new TextEncoder().encode(text)};
}
