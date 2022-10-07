import {exit} from "process";
import {forEachFn, mapFn} from "@softwareventures/array";
import chain from "@softwareventures/chain";
import {hasProperty} from "unknown";
import type {InitFailureReason} from "../project/init";
import init from "../project/init";
import {bindFailureFn, mapResultFn} from "../result/result";
import {createProject} from "../project/create";
import {parseAndCorrectSpdxExpression} from "../license/spdx/correct";

export interface InitOptions {
    readonly scope?: string | undefined;
    readonly name?: string | undefined;
    readonly githubOwner?: string | undefined;
    readonly githubProject?: string | undefined;
    readonly webapp?: boolean | undefined;
    readonly authorName?: string | undefined;
    readonly authorEmail?: string | undefined;
    readonly license?: string | undefined;
    readonly copyrightHolder?: string | undefined;
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
        target: options.webapp ?? false ? "webapp" : "npm",
        path,
        author: {
            name: options.authorName,
            email: options.authorEmail
        },
        license: {
            spdxLicense: parseAndCorrectSpdxExpression(options.license ?? "ISC"),
            copyrightHolder: options.copyrightHolder
        }
    })
        .then(init)
        .then(mapResultFn(() => exit(0)))
        .then(
            bindFailureFn(reasons => {
                chain(reasons)
                    .map(
                        mapFn((reason: InitFailureReason): string => {
                            switch (reason.type) {
                                case "file-exists":
                                    return `File Exists: ${reason.path}`;
                                case "not-a-directory":
                                    return `Not a Directory: ${reason.path}`;
                                case "git-init-failed":
                                    return "git init failed";
                                case "yarn-set-version-failed":
                                    return "yarn set version failed";
                                case "yarn-plugin-import-failed":
                                    return "yarn plugin import failed";
                                case "set-yarn-linker-failed":
                                    return "failed to set yarn linker";
                                case "yarn-install-failed":
                                    return "yarn install failed";
                                case "yarn-fix-failed":
                                    return `Failed to apply code style rules: ${reason.path}`;
                            }
                        })
                    )
                    .map(forEachFn(message => void console.error(`Error: ${message}`)));
                exit(1);
            })
        )
        .catch(reason => {
            if (Boolean(reason) && hasProperty(reason, "message")) {
                console.error(reason.message);
            } else {
                console.error(reason);
            }
            exit(1);
        });
}
