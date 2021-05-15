import {exit} from "process";
import chain from "@softwareventures/chain";
import {forEachFn, mapFn} from "@softwareventures/array";
import {readProject} from "../project/read";
import {bindFailureFn} from "../result/result";
import {updateProject} from "../project/update";

export function cliUpdate(path: string, options: object): void {
    readProject(path)
        .then(updateProject)
        .then(
            bindFailureFn(reasons => {
                chain(reasons)
                    .map(
                        mapFn(reason => {
                            switch (reason.type) {
                                case "not-a-directory":
                                    return `Not a Directory: ${reason.path}`;
                                case "file-exists":
                                    return `File Exists: ${reason.path}`;
                                case "git-not-clean":
                                    return `Git working copy not clean: ${reason.path}`;
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
