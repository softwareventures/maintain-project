import chain from "@softwareventures/chain";
import {openFsChangeset} from "../fs-changeset/fs-changeset";
import {readFileNode, readTextFile} from "../fs-changeset/file-node";
import {mapAsyncResultFn, mapResultFn, Result} from "../result/result";
import {ReadFileFailureReason} from "../fs-stage/read-file-failure-reason";
import {gitHostFromUrl} from "./git/git-host";
import {Project} from "./project";

export async function readProject(path: string): Promise<Result<ReadFileFailureReason, Project>> {
    const changeset = openFsChangeset(path);

    const packageJson = readTextFile(changeset, "package.json").then(mapResultFn(JSON.parse));

    const target = readFileNode(changeset, "webpack.config.js").then(result =>
        result.type === "success" && result.value.type === "file" ? "webapp" : "npm"
    );

    return packageJson.then(
        mapAsyncResultFn(async packageJson => {
            const npmPackage = chain(packageJson)
                .map(packageJson => packageJson.name ?? "")
                .map(name => /^(?:(@.*?)\/)?(.*)$/.exec(name) ?? ["", "", ""])
                .map(([_, scope, name]) => ({scope, name})).value;

            const gitHost =
                typeof packageJson.repository === "string"
                    ? gitHostFromUrl(packageJson.repository)
                    : undefined;

            return target.then(target => ({path, npmPackage, gitHost, target}));
        })
    );
}
