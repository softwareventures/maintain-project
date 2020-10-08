import {promises as fs} from "fs";
import {resolve} from "path";
import {fromUrl as gitInfoFromUrl} from "hosted-git-info";
import {Project} from "./project";

export async function readProject(path: string): Promise<Project> {
    path = resolve(path);

    const packageJson = fs.readFile(resolve(path, "package.json"), "utf-8").then(JSON.parse);

    const npmPackage = packageJson
        .then(packageJson => packageJson.name ?? "")
        .then(name => /^(?:(@.*?)\/)?(.*)$/.exec(name))
        .then(([_, scope, name]) => ({scope, name}));

    const githubProject = packageJson
        .then(packageJson => packageJson.repository)
        .then(gitInfoFromUrl)
        .then(info =>
            info?.type === "github" ? {owner: info.user, name: info.project} : undefined
        );

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

    return Promise.all([npmPackage, githubProject, target]).then(
        ([npmPackage, githubProject, target]) => ({
            path,
            npmPackage,
            githubProject,
            target
        })
    );
}
