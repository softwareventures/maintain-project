import {Success} from "../task/result";

export type CommitResult = Success | CommitFailure;

export interface CommitFailure {
    readonly type: "commit-failure";
    readonly reasons: readonly CommitFailureReason[];
}

export type CommitFailureReason = FileExists;

export interface FileExists {
    readonly type: "file-exists";
    readonly path: string;
}
