export interface GitIgnore {
    readonly path: string;
    readonly subDirectories: readonly GitIgnore[];
    readonly entries: readonly GitIgnoreGroup[];
}

export type GitIgnoreGroup = readonly GitIgnoreLine[];

export type GitIgnoreLine = GitIgnoreComment | GitIgnoreEntry;

export interface GitIgnoreComment {
    readonly type: "git-ignore-comment";
    readonly text: string;
}

export interface GitIgnoreEntry {
    readonly type: "git-ignore-entry";
    readonly text: string;
}

export function gitIgnoreComment(text: string): GitIgnoreComment {
    return {type: "git-ignore-comment", text};
}

export function gitIgnoreEntry(text: string): GitIgnoreEntry {
    return {type: "git-ignore-entry", text};
}
