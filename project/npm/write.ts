import {promises as fs} from "fs";
import {resolve} from "path";
import {format as formatPackageJson} from "prettier-package-json";
import {Result} from "../../index";
import {Project} from "../project";

export async function writePackageJson(project: Project): Promise<Result> {
    const sourcePath = require.resolve("./template/package.json");
    const destPath = resolve(project.path, "package.json");
    const npmPackage = project.npmPackage;

    return fs
        .readFile(sourcePath, {encoding: "utf8"})
        .then(text => JSON.parse(text))
        .then(json => ({
            ...json,
            name: npmPackage.scope ? `${npmPackage.scope}/${npmPackage.name}` : npmPackage.name,
            homepage: `https://github.com/softwareventures/${npmPackage.name}`,
            bugs: `https://github.com/softwareventures/${npmPackage.name}/issues`,
            repository: `github:softwareventures/${npmPackage.name}`
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
