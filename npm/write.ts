import chain from "@softwareventures/chain";
import {mapNullable} from "@softwareventures/nullable";
import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {chainAsyncResultsFn, success} from "../result/result";
import {copyFromTemplate} from "../template/copy";
import {modifyTemplateText} from "../template/modify-text";
import {bugsUrl, homepageUrl, repositoryShortcut} from "../git/git-host";
import {Project} from "../project/project";
import {nodeVersionRange} from "../node/version-range";
import {formatSpdxExpression} from "../license/spdx/format";
import {projectTemplateId} from "../template/project-template-id";
import {formatPackageJson} from "./format-package-json";

export function writeNpmFiles(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    return chainAsyncResultsFn([writePackageJson(project), writeNpmIgnore(project)]);
}

function writePackageJson(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    const {npmPackage, gitHost} = project;

    const file = modifyTemplateText({
        templateId: projectTemplateId(project),
        pathSegments: ["package.json"],
        modify: text =>
            chain(text)
                .map(JSON.parse)
                .map(json => ({
                    ...json,
                    private: true,
                    name: npmPackage.scope
                        ? `@${npmPackage.scope}/${npmPackage.name}`
                        : npmPackage.name,
                    version: "0.0.0-development",
                    description: "",
                    keywords: [],
                    author: formatAuthor(project),
                    homepage: gitHost == null ? undefined : homepageUrl(gitHost),
                    bugs: gitHost == null ? undefined : bugsUrl(gitHost),
                    repository: gitHost == null ? undefined : repositoryShortcut(gitHost),
                    license:
                        mapNullable(project.license.spdxLicense, formatSpdxExpression) ?? undefined,
                    scripts: {
                        ...json.scripts,
                        build: project.target === "webapp" ? json.scripts.build : undefined,
                        prepare: project.target === "npm" ? json.scripts.prepare : undefined,
                        start: project.target === "webapp" ? json.scripts.start : undefined
                    },
                    engines: {
                        node: nodeVersionRange(project.node.currentReleases)
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
                    },
                    publishConfig: undefined
                }))
                .map(formatPackageJson).value
    });

    return async fsStage => file.then(file => insert(fsStage, "package.json", file));
}

function writeNpmIgnore(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    if (project.target === "npm") {
        const file = copyFromTemplate(projectTemplateId(project), "npmignore.template");
        return async fsStage => file.then(file => insert(fsStage, ".npmignore", file));
    } else {
        return async fsStage => success(fsStage);
    }
}

function formatAuthor(project: Project): string {
    return `${project.author?.name ?? ""}${
        project.author?.email ? ` <${project.author.email}>` : ""
    }`;
}
