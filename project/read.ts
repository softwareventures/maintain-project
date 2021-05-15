import {promises as fs} from "fs";
import {resolve} from "path";
import chain from "@softwareventures/chain";
import {gitHostFromUrl} from "./git/git-host";
import {Project} from "./project";

export async function readProject(path: string): Promise<Project> {
    path = resolve(path);

    const packageJson = fs.readFile(resolve(path, "package.json"), "utf-8").then(JSON.parse);

    const npmPackage = packageJson
        .then(packageJson => packageJson.name ?? "")
        .then(name => /^(?:(@.*?)\/)?(.*)$/.exec(name) ?? ["", "", ""])
        .then(([_, scope, name]) => ({scope, name}));

    const gitHost = packageJson.then(packageJson => packageJson.repository).then(gitHostFromUrl);

    const target = fs
        .stat(resolve(path, "webpack.config.js"))
        .catch(reason => {
            if (reason.code === "ENOENT") {
                return undefined;
            } else {
                throw reason;
            }
        })
        .then(stats => (stats?.isFile() ? "webapp" : "npm"));

    const author = packageJson.then(({author}) =>
        typeof author === "object"
            ? {name: author.name, email: author.email}
            : typeof author === "string"
            ? chain(/^\s*(.*)(?:\s+<\s*(.*)\s*>)?\s*$/.exec(author) ?? []).map(
                  ([_, name, email]) => ({name, email})
              ).value
            : {}
    );

    return Promise.all([npmPackage, gitHost, target, author]).then(
        ([npmPackage, gitHost, target, author]) => ({
            path,
            npmPackage,
            gitHost,
            target,
            author,
            license: {
                year: new Date().getUTCFullYear()
            }
        })
    );
}
