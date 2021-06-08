import {exit} from "process";
import {forEachFn, mapFn} from "@softwareventures/array";
import chain from "@softwareventures/chain";
import {mapNullable} from "@softwareventures/nullable";
import init, {InitFailureReason} from "../project/init";
import {bindFailureFn, mapResultFn} from "../result/result";
import {createProject} from "../project/create";
import {parseAndCorrectSpdxExpression} from "../license/spdx/correct";

export interface InitOptions {
    readonly scope?: string;
    readonly name?: string;
    readonly githubOwner?: string;
    readonly githubProject?: string;
    readonly webapp?: boolean;
    readonly authorName?: string;
    readonly authorEmail?: string;
    readonly license?: string;
    readonly copyrightHolder?: string;
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
        path,
        author: {
            name: options.authorName,
            email: options.authorEmail
        },
        license: {
            spdxLicense: mapNullable(options.license, parseAndCorrectSpdxExpression) ?? undefined,
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
                                case "yarn-install-failed":
                                    return "yarn install failed";
                                case "yarn-fix-failed":
                                    return "Failed to apply code style rules";
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
