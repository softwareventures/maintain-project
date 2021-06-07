import {resolve} from "path";
import chain from "@softwareventures/chain";
import {todayUtc} from "@softwareventures/date";
import {gitHostFromUrl} from "../git/git-host";
import {createNodeVersions} from "../node/create";
import {readProjectText} from "./read-text";
import {statProjectFile} from "./stat-file";
import {Project} from "./project";

export async function readProject(path: string): Promise<Project> {
    path = resolve(path);

    const project = {path};

    const packageJson = readProjectText(project, "package.json").then(JSON.parse);

    const npmPackage = packageJson
        .then(packageJson => packageJson.name ?? "")
        .then(name => /^(?:(@.*?)\/)?(.*)$/.exec(name) ?? ["", "", ""])
        .then(([_, scope, name]) => ({scope, name}));

    const gitHost = packageJson.then(packageJson => packageJson.repository).then(gitHostFromUrl);

    const target = statProjectFile(project, "webpack.config.js")
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
            ? chain(/^\s*(.*?)(?:\s+<\s*(.*)\s*>)?\s*$/.exec(author) ?? []).map(
                  ([_, name, email]) => ({name, email})
              ).value
            : {}
    );

    const today = todayUtc();

    return Promise.all([npmPackage, gitHost, target, author]).then(
        ([npmPackage, gitHost, target, author]) => ({
            path,
            npmPackage,
            gitHost,
            node: createNodeVersions(today),
            target,
            author,
            license: {
                year: today.year
            }
        })
    );
}
