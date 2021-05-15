export interface File {
    readonly type: "fs-changeset-file";
    readonly path: readonly string[];
}
