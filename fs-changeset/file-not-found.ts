export interface FileNotFound {
    readonly type: "file-not-found";
    readonly path: string;
}
