export interface File {
    readonly type: "file";
    readonly data: ArrayBufferLike;
}

export function file(data: ArrayBufferLike): File {
    return {type: "file", data};
}

export function textFile(text: string): File {
    return {type: "file", data: new TextEncoder().encode(text)};
}
