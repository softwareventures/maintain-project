import {exit} from "process";
import chain from "@softwareventures/chain";
import {forEachFn, mapFn} from "@softwareventures/array";
import {readProject} from "../project/read";
import {bindAsyncResultFn, bindFailureFn} from "../result/result";
import {UpdateFailureReason, updateProject} from "../project/update";
import {ReadJsonFailureReason} from "../project/read-json";
import {Project} from "../project/project";

export function cliUpdate(path: string, options: object): void {
    readProject(path)
        .then(bindAsyncResultFn<ReadJsonFailureReason, UpdateFailureReason, Project>(updateProject))
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
