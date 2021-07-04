import {exit} from "process";
import chain from "@softwareventures/chain";
import {forEachFn, mapFn} from "@softwareventures/array";
import {readProject, ReadProjectFailureReason} from "../project/read";
import {bindAsyncResultFn, bindFailureFn} from "../result/result";
import {UpdateFailureReason, updateProject} from "../project/update";
import {Project} from "../project/project";

export interface UpdateOptions {
    readonly breaking?: boolean;
}

export function cliUpdate(path: string, {breaking}: UpdateOptions): void {
    readProject(path)
        .then(
            bindAsyncResultFn<ReadProjectFailureReason, UpdateFailureReason, Project>(
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
                    .map(forEachFn(message => console.error(`Error: ${message}`)));
                exit(1);
            })
        )
        .catch(reason => {
            if (!!reason && reason.message) {
                console.error(reason.message);
            } else {
                console.error(reason);
            }
            exit(1);
        });
}
