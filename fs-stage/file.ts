export interface File {
    readonly type: "file";
    readonly data: Uint8Array;
}

export function file(data: Uint8Array): File {
    return {type: "file", data};
}

export function textFile(text: string): File {
    return {type: "file", data: new TextEncoder().encode(text)};
}
