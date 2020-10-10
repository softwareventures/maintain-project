import {exit} from "process";
import init from "../project/init";
import {createProject} from "../project/project";

export interface InitOptions {
    readonly scope?: string;
    readonly name?: string;
    readonly githubOwner?: string;
    readonly githubProject?: string;
    readonly webapp?: boolean;
}

export function cliInit(path: string, options: InitOptions): void {
    createProject({
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
        .then(result => {
            switch (result.type) {
                case "success":
                    exit();
                    break;
                case "not-directory":
                    console.error("Target exists and is not a directory");
                    exit(1);
                    break;
                case "not-empty":
                    console.error("Directory not empty");
                    exit(1);
                    break;
                case "yarn-install-failed":
                    console.error("yarn install failed");
                    exit(1);
                    break;
                case "yarn-fix-failed":
                    console.error("Failed to apply code style rules");
                    exit(1);
                    break;
            }
        })
        .catch(reason => {
            if (!!reason && reason.message) {
                console.error(reason.message);
            } else {
                console.error(reason);
            }
            exit(1);
        });
}
