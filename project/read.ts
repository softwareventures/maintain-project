import {resolve} from "path";
import {chain} from "@softwareventures/chain";
import {todayUtc} from "@softwareventures/date";
import {mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import {hasProperty} from "unknown";
import {gitHostFromUrl} from "../git/git-host.js";
import {parseAndCorrectSpdxExpression} from "../license/spdx/correct.js";
import type {Result} from "../result/result.js";
import {allAsyncResults, mapResultFn} from "../result/result.js";
import type {ReadNodeVersionsFailureReason} from "../node/read.js";
import {readNodeVersions} from "../node/read.js";
import {guessCopyrightHolder} from "../license/guess-copyright-holder.js";
import {readGitProject} from "../git/read.js";
import {readTslintProject} from "../tslint/read.js";
import {readEslintProject} from "../eslint/read.js";
import type {Project} from "./project.js";
import type {ReadJsonFailureReason} from "./read-json.js";
import {readProjectJson} from "./read-json.js";
import {projectFileExists} from "./file-exists.js";

export type ReadProjectResult = Result<ReadProjectFailureReason, Project>;

export type ReadProjectFailureReason = ReadJsonFailureReason | ReadNodeVersionsFailureReason;

export async function readProject(path: string): Promise<ReadProjectResult> {
    const path2 = resolve(path);

    const project = {path: path2};

    const packageJson = readProjectJson(project, "package.json");

    const npmPackage = packageJson
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .then(mapResultFn(packageJson => String(packageJson?.name ?? "")))
        .then(
            mapResultFn(
                name => /^(?:(@.*?)\/)?(.*)$/u.exec(String(name)) ?? (["", undefined, ""] as const)
            )
        )
        .then(mapResultFn(([_, scope, name]) => ({scope, name})));

    const git = readGitProject(project);

    const gitHost = packageJson
        .then(
            mapResultFn(packageJson =>
                hasProperty(packageJson, "repository") ? String(packageJson.repository) : null
            )
        )
        .then(mapResultFn(mapNullableFn(gitHostFromUrl)))
        .then(mapResultFn(gitHost => gitHost ?? undefined));

    const target = projectFileExists(project, "webpack.config.cjs")
        .then(async webpack => webpack || projectFileExists(project, "webpack.config.js"))
        .then(webpack => (webpack ? "webapp" : "npm"));

    const tslint = readTslintProject(project);

    const eslint = readEslintProject(project);

    const author = packageJson
        .then(
            mapResultFn((packageJson: unknown) =>
                hasProperty(packageJson, "author") ? packageJson.author : null
            )
        )
        .then(
            mapResultFn(author =>
                typeof author === "object"
                    ? {
                          ...(hasProperty(author, "name") ? {name: String(author.name)} : null),
                          ...(hasProperty(author, "email") ? {email: String(author.email)} : null)
                      }
                    : typeof author === "string"
                      ? chain(/^\s*(.*?)(?:\s+<\s*(.*)\s*>)?\s*$/u.exec(author) ?? []).map(
                            ([_, name, email]) => ({name, email})
                        ).value
                      : {}
            )
        );

    const spdxLicense = packageJson
        .then(
            mapResultFn((packageJson: unknown) =>
                hasProperty(packageJson, "license") && typeof packageJson.license === "string"
                    ? packageJson.license
                    : null
            )
        )
        .then(mapResultFn(mapNullableFn(parseAndCorrectSpdxExpression)))
        .then(mapResultFn(mapNullFn(() => undefined)));

    const today = todayUtc();

    const node = readNodeVersions(project, today);

    return Promise.all([git, target, tslint, eslint]).then(async ([git, target, tslint, eslint]) =>
        allAsyncResults([npmPackage, gitHost, author, spdxLicense, node]).then(
            mapResultFn(([npmPackage, gitHost, author, spdxLicense, node]) => ({
                path: path2,
                npmPackage,
                git,
                gitHost,
                node,
                target,
                tslint,
                eslint,
                author,
                license: {
                    spdxLicense,
                    year: today.year,
                    copyrightHolder: guessCopyrightHolder({npmPackage, gitHost, author})
                }
            }))
        )
    );
}
