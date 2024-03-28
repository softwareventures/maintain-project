import {exit} from "process";
import {chain} from "@softwareventures/chain";
import {forEachFn, mapFn} from "@softwareventures/array";
import type {ReadProjectFailureReason} from "../project/read.js";
import {readProject} from "../project/read.js";
import {bindAsyncResultFn, bindFailureFn} from "../result/result.js";
import type {UpdateFailureReason} from "../project/update.js";
import {updateProject} from "../project/update.js";
import type {Project} from "../project/project.js";

export interface UpdateOptions {
    readonly breaking?: boolean | undefined;
}

export function cliUpdate(path: string, {breaking}: UpdateOptions): void {
    void readProject(path)
        .then(
            bindAsyncResultFn<ReadProjectFailureReason, UpdateFailureReason, Project, Project>(
                async project => updateProject({project, breaking})
            )
        )
        .then(
            bindFailureFn(reasons => {
                chain(reasons)
                    .map(
                        mapFn(reason => {
                            switch (reason.type) {
                                case "file-not-found":
                                    return `File Not Found: ${reason.path}`;
                                case "file-is-directory":
                                    return `File Is A Directory: ${reason.path}`;
                                case "not-a-directory":
                                    return `Not a Directory: ${reason.path}`;
                                case "file-exists":
                                    return `File Exists: ${reason.path}`;
                                case "invalid-json":
                                    return `Invalid JSON: ${reason.path}`;
                                case "invalid-yaml":
                                    return `Invalid YAML: ${reason.path}`;
                                case "git-not-clean":
                                    return `Git working copy not clean: ${reason.path}`;
                                case "yarn-fix-failed":
                                case "prettier-fix-failed":
                                    return `Failed to apply code style rules: ${reason.path}`;
                            }
                        })
                    )
                    .map(forEachFn(message => void console.error(`Error: ${message}`)));
                exit(1);
            })
        );
}
