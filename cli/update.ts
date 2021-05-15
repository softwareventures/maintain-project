// import {exit} from "process";
// import chain from "@softwareventures/chain";
// import {forEachFn, mapFn} from "@softwareventures/array";
// import {readProject} from "../project/read";
// import {update} from "../project/update";
// import {bindFailureFn, mapResultFn} from "../result/result";
// import {ReadFileFailureReason} from "../fs-stage/read-file-failure-reason";
//
export function cliUpdate(path: string, options: object): void {
    // TODO
    //     readProject(path)
    //         .then(mapResultFn(update))
    //         .then(
    //             bindFailureFn(reasons => {
    //                 chain(reasons)
    //                     .map(
    //                         mapFn((reason: ReadFileFailureReason): string => {
    //                             switch (reason.type) {
    //                                 case "invalid-path":
    //                                     return `Invalid Path: ${reason.path}`;
    //                                 case "not-a-directory":
    //                                     return `Not a Directory: ${reason.path}`;
    //                                 case "file-is-directory":
    //                                     return `Expected a file but found a directory: ${reason.path}`;
    //                                 case "file-not-found":
    //                                     return `File Not Found: ${reason.path}`;
    //                             }
    //                         })
    //                     )
    //                     .map(forEachFn(message => console.error(`Error: ${message}`)));
    //                 exit(1);
    //             })
    //         )
    //         .catch(reason => {
    //             if (!!reason && reason.message) {
    //                 console.error(reason.message);
    //             } else {
    //                 console.error(reason);
    //             }
    //             exit(1);
    //         });
}
