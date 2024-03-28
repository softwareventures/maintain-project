import {chain} from "@softwareventures/chain";
import {mapNullable} from "@softwareventures/nullable";
import {hasProperty} from "unknown";
import type {FsStage, InsertResult} from "../fs-stage/fs-stage.js";
import {insert} from "../fs-stage/fs-stage.js";
import {chainAsyncResultsFn, success} from "../result/result.js";
import {copyFromTemplate} from "../template/copy.js";
import {modifyTemplateText} from "../template/modify-text.js";
import {bugsUrl, homepageUrl, repositoryShortcut} from "../git/git-host.js";
import type {Project} from "../project/project.js";
import {nodeVersionRange} from "../node/version-range.js";
import {formatSpdxExpression} from "../license/spdx/format.js";
import {projectTemplateId} from "../template/project-template-id.js";
import {formatPackageJson} from "./format-package-json.js";

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
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                .map(json => ({
                    ...json,
                    private: true,
                    name:
                        npmPackage.scope == null
                            ? npmPackage.name
                            : `@${npmPackage.scope}/${npmPackage.name}`,
                    version: "0.0.0-development",
                    description: "",
                    keywords: [],
                    author: formatAuthor(project),
                    homepage: gitHost == null ? undefined : homepageUrl(gitHost),
                    bugs: gitHost == null ? undefined : bugsUrl(gitHost),
                    repository: gitHost == null ? undefined : repositoryShortcut(gitHost),
                    license:
                        mapNullable(project.license.spdxLicense, formatSpdxExpression) ?? undefined,
                    scripts:
                        hasProperty(json, "scripts") && typeof json.scripts === "object"
                            ? {
                                  ...json.scripts,
                                  _postinstall: undefined,
                                  postinstall: hasProperty(json.scripts, "postinstall")
                                      ? json.scripts.postinstall
                                      : hasProperty(json.scripts, "_postinstall")
                                        ? json.scripts._postinstall
                                        : undefined
                              }
                            : undefined,
                    engines: {
                        node: nodeVersionRange(project.node.currentReleases)
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
        project.author?.email == null ? "" : ` <${project.author.email}>`
    }`;
}
