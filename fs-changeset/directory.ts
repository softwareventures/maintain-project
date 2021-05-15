export interface Directory {
    readonly type: "fs-changeset-directory";
    readonly path: readonly string[];
}
