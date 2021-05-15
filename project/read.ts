// TODO
// import chain from "@softwareventures/chain";
// import {openFsChangeset} from "../fs-changeset/fs-changeset";
// import {readFileNode, readTextFile} from "../fs-changeset/file-node";
// import {mapAsyncResultFn, mapResultFn, Result} from "../result/result";
// import {ReadFileFailureReason} from "../fs-stage/read-file-failure-reason";
// import {gitHostFromUrl} from "./git/git-host";
// import {UpdatableProject} from "./project";
//
// export async function readProject(
//     path: string
// ): Promise<Result<ReadFileFailureReason, UpdatableProject>> {
//     const changeset = openFsChangeset(path);
//
//     const packageJson = changeset
//         .then(async changeset => readTextFile(changeset, "package.json"))
//         .then(mapResultFn(JSON.parse));
//
//     const target = changeset
//         .then(async changeset => readFileNode(changeset, "webpack.config.js"))
//         .then(result =>
//             result.type === "success" && result.value.type === "file" ? "webapp" : "npm"
//         );
//
//     return packageJson.then(
//         mapAsyncResultFn(async packageJson => {
//             const npmPackage = chain(packageJson)
//                 .map(packageJson => packageJson.name ?? "")
//                 .map(name => /^(?:(@.*?)\/)?(.*)$/.exec(name) ?? ["", "", ""])
//                 .map(([_, scope, name]) => ({scope, name})).value;
//
//             const gitHost =
//                 typeof packageJson.repository === "string"
//                     ? gitHostFromUrl(packageJson.repository)
//                     : undefined;
//
//             return Promise.all([changeset, target]).then(([changeset, target]) => ({
//                 changeset,
//                 npmPackage,
//                 gitHost,
//                 target
//             }));
//         })
//     );
// }
