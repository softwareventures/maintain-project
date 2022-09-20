// naming-convention isn't smart enough to understand that "a" is a word
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface NotADirectory {
    readonly type: "not-a-directory";
    readonly path: string;
}
