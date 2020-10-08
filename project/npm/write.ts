import {promises as fs} from "fs";
import {resolve} from "path";
import {format as formatPackageJson} from "prettier-package-json";
import {copy} from "../../task/copy";
import {combineResults, Result} from "../../task/result";
import {bugsUrl, homepageUrl, repositoryShortcut} from "../git/git-host";
import {Project} from "../project";

export async function writeNpmFiles(project: Project): Promise<Result> {
    return combineResults([writePackageJson(project), writeNpmIgnore(project)]);
}

async function writePackageJson(project: Project): Promise<Result> {
    const sourcePath = require.resolve("../../template/package.json");
    const destPath = resolve(project.path, "package.json");
    const {npmPackage, gitHost} = project;

    return fs
        .readFile(sourcePath, {encoding: "utf8"})
        .then(text => JSON.parse(text))
        .then(json => ({
            ...json,
            name: npmPackage.scope ? `@${npmPackage.scope}/${npmPackage.name}` : npmPackage.name,
            homepage: gitHost == null ? undefined : homepageUrl(gitHost),
            bugs: gitHost == null ? undefined : bugsUrl(gitHost),
            repository: gitHost == null ? undefined : repositoryShortcut(gitHost),
            scripts: {
                ...json.scripts,
                build: project.target === "webapp" ? json.scripts.build : undefined,
                prepare: project.target === "npm" ? json.scripts.prepare : undefined,
                start: project.target === "webapp" ? json.scripts.start : undefined
            },
            devDependencies: {
                ...json.devDependencies,
                "@softwareventures/tsconfig":
                    project.target === "npm"
                        ? json.devDependencies["@softwareventures/tsconfig"]
                        : undefined,
                "@softwareventures/webpack-config":
                    project.target === "webapp"
                        ? json.devDependencies["@softwareventures/webpack-config"]
                        : undefined,
                "ts-loader":
                    project.target === "webapp" ? json.devDependencies["ts-loader"] : undefined,
                "webpack": project.target === "webapp" ? json.devDependencies.webpack : undefined,
                "webpack-cli":
                    project.target === "webapp" ? json.devDependencies["webpack-cli"] : undefined,
                "webpack-dev-server":
                    project.target === "webapp"
                        ? json.devDependencies["webpack-dev-server"]
                        : undefined
            }
        }))
        .then(json =>
            formatPackageJson(json, {
                keyOrder: [
                    "private",
                    "name",
                    "version",
                    "description",
                    "keywords",
                    "author",
                    "maintainers",
                    "contributors",
                    "homepage",
                    "bugs",
                    "repository",
                    "license",
                    "scripts",
                    "main",
                    "module",
                    "browser",
                    "man",
                    "preferGlobal",
                    "bin",
                    "files",
                    "directories",
                    "sideEffects",
                    "types",
                    "typings",
                    "dependencies",
                    "optionalDependencies",
                    "bundleDependencies",
                    "bundledDependencies",
                    "peerDependencies",
                    "devDependencies",
                    "engines",
                    "engine-strict",
                    "engineStrict",
                    "os",
                    "cpu",
                    "eslintConfig",
                    "prettier",
                    "config",
                    "ava",
                    "release"
                ]
            })
        )
        .then(async text => fs.writeFile(destPath, text, {encoding: "utf8", flag: "wx"}))
        .then(
            () => ({type: "success"}),
            reason => {
                if (reason.code === "EEXIST") {
                    return {type: "not-empty"};
                } else {
                    throw reason;
                }
            }
        );
}

async function writeNpmIgnore(project: Project): Promise<Result> {
    if (project.target === "npm") {
        return copy("npmignore.template", project.path, ".npmignore");
    } else {
        return {type: "success"};
    }
}
