import chain from "@softwareventures/chain";
import {format as formatPackageJson} from "prettier-package-json";
import {FsChangeset, insert, InsertResult} from "../../fs-changeset/fs-changeset";
import {chainAsyncResultsFn} from "../../result/result";
import {copy} from "../../template/copy";
import {modifyText} from "../../template/modify-text";
import {bugsUrl, homepageUrl, repositoryShortcut} from "../git/git-host";
import {Project} from "../project";

export function writeNpmFiles(
    project: Project
): (fsChangeset: FsChangeset) => Promise<InsertResult> {
    return chainAsyncResultsFn([writePackageJson(project), writeNpmIgnore(project)]);
}

function writePackageJson(project: Project): (fsChangeset: FsChangeset) => Promise<InsertResult> {
    const {npmPackage, gitHost} = project;

    const file = modifyText(
        "package.json",
        text =>
            chain(text)
                .map(JSON.parse)
                .map(json => ({
                    ...json,
                    name: npmPackage.scope
                        ? `@${npmPackage.scope}/${npmPackage.name}`
                        : npmPackage.name,
                    homepage: gitHost == null ? undefined : homepageUrl(gitHost),
                    bugs: gitHost == null ? undefined : bugsUrl(gitHost),
                    repository: gitHost == null ? undefined : repositoryShortcut(gitHost),
                    scripts: {
                        ...json.scripts,
                        build: project.target === "webapp" ? json.scripts.build : undefined,
                        prepare: project.target === "npm" ? json.scripts.prepare : undefined,
                        start: project.target === "webapp" ? json.scripts.start : undefined
                    },
                    dependencies: {
                        ...json.dependencies,
                        "@types/webpack-env":
                            project.target === "webapp"
                                ? json.dependencies["@types/webpack-env"]
                                : undefined
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
                            project.target === "webapp"
                                ? json.devDependencies["ts-loader"]
                                : undefined,
                        "webpack":
                            project.target === "webapp" ? json.devDependencies.webpack : undefined,
                        "webpack-cli":
                            project.target === "webapp"
                                ? json.devDependencies["webpack-cli"]
                                : undefined,
                        "webpack-dev-server":
                            project.target === "webapp"
                                ? json.devDependencies["webpack-dev-server"]
                                : undefined
                    }
                }))
                .map(json =>
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
                ).value
    );

    return async fsChangeset => file.then(file => insert(fsChangeset, "package.json", file));
}

function writeNpmIgnore(project: Project): (fsChangeset: FsChangeset) => Promise<InsertResult> {
    if (project.target === "npm") {
        const file = copy("npmignore.template");
        return async fsChangeset => file.then(file => insert(fsChangeset, ".npmignore", file));
    } else {
        return async fsChangeset => ({type: "success", value: fsChangeset});
    }
}
