import {resolve} from "path";
import chain from "@softwareventures/chain";
import {todayUtc} from "@softwareventures/date";
import {mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import {gitHostFromUrl} from "../git/git-host";
import {parseAndCorrectSpdxExpression} from "../license/spdx/correct";
import {allAsyncResults, mapResultFn, Result} from "../result/result";
import {readNodeVersions, ReadNodeVersionsFailureReason} from "../node/read";
import {guessCopyrightHolder} from "../license/guess-copyright-holder";
import {readGitProject} from "../git/read";
import {readTslintProject} from "../tslint/read";
import {readEslintProject} from "../eslint/read";
import {Project} from "./project";
import {ReadJsonFailureReason, readProjectJson} from "./read-json";
import {projectFileExists} from "./file-exists";

export type ReadProjectResult = Result<ReadProjectFailureReason, Project>;

export type ReadProjectFailureReason = ReadJsonFailureReason | ReadNodeVersionsFailureReason;

export async function readProject(path: string): Promise<ReadProjectResult> {
    path = resolve(path);

    const project = {path};

    const packageJson = readProjectJson(project, "package.json");

    const npmPackage = packageJson
        .then(mapResultFn(packageJson => packageJson?.name ?? ""))
        .then(mapResultFn(name => /^(?:(@.*?)\/)?(.*)$/.exec(String(name)) ?? ["", "", ""]))
        .then(mapResultFn(([_, scope, name]) => ({scope, name})));

    const git = readGitProject(project);

    const gitHost = packageJson
        .then(mapResultFn(packageJson => packageJson?.repository))
        .then(mapResultFn(gitHostFromUrl));

    const target = projectFileExists(project, "webpack.config.cjs")
        .then(webpack => webpack || projectFileExists(project, "webpack.config.js"))
        .then(webpack => (webpack ? "webapp" : "npm"));

    const tslint = readTslintProject(project);

    const eslint = readEslintProject(project);

    const author = packageJson
        .then(mapResultFn(packageJson => packageJson?.author))
        .then(
            mapResultFn(author =>
                typeof author === "object"
                    ? {name: String(author?.name), email: String(author?.email)}
                    : typeof author === "string"
                    ? chain(/^\s*(.*?)(?:\s+<\s*(.*)\s*>)?\s*$/.exec(author) ?? []).map(
                          ([_, name, email]) => ({name, email})
                      ).value
                    : {}
            )
        );

    const spdxLicense = packageJson
        .then(
            mapResultFn(packageJson =>
                typeof packageJson?.license === "string" ? packageJson?.license : null
            )
        )
        .then(mapResultFn(mapNullableFn(parseAndCorrectSpdxExpression)))
        .then(mapResultFn(mapNullFn(() => undefined)));

    const today = todayUtc();

    const node = readNodeVersions(project, today);

    return Promise.all([git, target, tslint, eslint]).then(async ([git, target, tslint, eslint]) =>
        allAsyncResults([npmPackage, gitHost, author, spdxLicense, node]).then(
            mapResultFn(([npmPackage, gitHost, author, spdxLicense, node]) => ({
                path,
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
