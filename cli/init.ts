import {exit} from "process";
import {forEachFn, mapFn} from "@softwareventures/array";
import chain from "@softwareventures/chain";
import init, {InitFailureReason} from "../project/init";
import {createProject} from "../project/project";
import {bindFailureFn, mapResultFn} from "../result/result";

export interface InitOptions {
    readonly scope?: string;
    readonly name?: string;
    readonly githubOwner?: string;
    readonly githubProject?: string;
    readonly webapp?: boolean;
}

export function cliInit(path: string, options: InitOptions): void {
    void createProject({
        npmPackage: {
            scope: options.scope,
            name: options.name
        },
        gitHost: {
            user: options.githubOwner,
            project: options.githubProject
        },
        target: options.webapp ? "webapp" : "npm",
        path
    })
        .then(init)
        .then(mapResultFn(() => exit(0)))
        .then(
            bindFailureFn(reasons => {
                chain(reasons)
                    .map(
                        mapFn((reason: InitFailureReason): string => {
                            switch (reason.type) {
                                // TODO: File exists and is not a directory.
                                case "file-exists":
                                    return "Directory not empty";
                                case "yarn-install-failed":
                                    return "yarn install failed";
                                case "yarn-fix-failed":
                                    return "Failed to apply code style rules";
                            }
                        })
                    )
                    .map(forEachFn(message => console.error(message)));
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
