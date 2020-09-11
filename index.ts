#!/usr/bin/env node
import {argv, cwd, exit} from "process";
import {last} from "@softwareventures/array";
import {Command} from "commander";
import init from "./project/init";
import {createProject} from "./project/project";
import {name, version} from "./package.json";

function main(destDir: string): void {
    init(createProject({path: destDir}))
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

if (require.main === module) {
    new Command()
        .storeOptionsAsProperties(false)
        .passCommandToAction(false)
        .name(last(name.split("/")) ?? "")
        .version(version)
        .arguments("[destination]")
        .action(destination => main(destination ?? cwd()))
        .parse(argv);
}
