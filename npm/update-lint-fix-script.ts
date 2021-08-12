import {mapNull, mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import {excludeNull, mapFn} from "@softwareventures/array";
import {ProjectSource} from "../project/project";
import {FsStageUpdate} from "../project/update";
import {isTypescriptProject} from "../typescript/is-typescript-project";
import {readTsconfig} from "../typescript/read-tsconfig";
import {isSuccess, mapResultFn, toNullable} from "../result/result";
import {isPrettierProject} from "../prettier/is-prettier-project";
import {isEslintProject} from "../eslint/is-eslint-project";
import {arraysEqual, findExtract} from "../collections/arrays";
import {insert} from "../fs-stage/fs-stage";
import {isTslintProject} from "../tslint/is-tslint-project";
import {modifyProjectScript} from "./modify-script";
import {readProjectScript} from "./read-script";

export async function updateLintFixScript(
    project: ProjectSource,
    script: "lint" | "fix"
): Promise<FsStageUpdate | null> {
    const existingScript = readProjectScript(project, script);

    const isTypeScript = isTypescriptProject(project);
    const tsconfig = isTypeScript.then(isTypeScript =>
        isTypeScript ? readTsconfig(project) : null
    );
    const isTsNoEmit = tsconfig
        .then(mapNullableFn(mapResultFn(tsconfig => tsconfig.options.noEmit)))
        .then(result => result != null && isSuccess(result) && result.value);

    const isPrettier = isPrettierProject(project);
    const isEslint = isEslintProject(project);
    const isTslint = isTslintProject(project);

    const commands = existingScript
        .then(mapNullableFn(script => script.split("&&")))
        .then(mapNullableFn(mapFn(command => command.trim())))
        .then(mapNullFn(() => []));

    const newCommands = commands
        .then(async commands => {
            const [existingTscCommand, commands2] = findExtract(
                commands,
                command => !!command.match(/^tsc(\s|$)/)
            );
            const [existingEslintCommand, commands3] = findExtract(
                commands2,
                command => !!command.match(/^eslint(\s|$)/)
            );
            const [existingTslintCommand, commands4] = findExtract(
                commands3,
                command => !!command.match(/^tslint(\s|$)/)
            );
            const [existingPrettierCommand, commands5] = findExtract(
                commands4,
                command => !!command.match(/^prettier(\s|$)/)
            );

            const tscCommand = Promise.resolve(
                mapNull(existingTscCommand, async () =>
                    Promise.all([isTypeScript, isTsNoEmit]).then(([isTypeScript, isTsNoEmit]) =>
                        isTypeScript ? (isTsNoEmit ? "tsc" : "tsc --noEmit") : null
                    )
                )
            );

            const prettierCommand = Promise.resolve(
                mapNull(existingPrettierCommand, async () =>
                    isPrettier.then(isPrettier =>
                        isPrettier
                            ? script === "fix"
                                ? "prettier --write ."
                                : "prettier --check ."
                            : null
                    )
                )
            );

            const eslintCommand = Promise.resolve(
                mapNull(existingEslintCommand, async () =>
                    isEslint.then(isEslint =>
                        isEslint ? (script === "fix" ? "eslint --fix ." : "eslint .") : null
                    )
                )
            );

            const tslintCommand = Promise.resolve(
                mapNull(existingTslintCommand, async () =>
                    isTslint.then(isTslint =>
                        isTslint
                            ? script === "fix"
                                ? "tslint --fix --project ."
                                : "tslint --project ."
                            : null
                    )
                )
            );

            return Promise.all([tscCommand, prettierCommand, eslintCommand])
                .then(([tscCommand, prettierCommand, eslintCommand]) => [
                    tscCommand,
                    eslintCommand,
                    tslintCommand,
                    prettierCommand,
                    ...commands5
                ])
                .then(excludeNull);
        })
        .then(async newCommands =>
            commands.then(commands => (arraysEqual(commands, newCommands) ? null : newCommands))
        );

    const log = commands.then(
        commands =>
            `build(npm): ${commands.length === 0 ? "add missing" : "update"} ${script} script`
    );

    const file = newCommands
        .then(
            mapNullableFn(async commands =>
                modifyProjectScript(project, script, () => commands.join(" && "))
            )
        )
        .then(mapNullableFn(toNullable));

    return file.then(
        mapNullableFn(async file =>
            log.then(log => ({
                type: "fs-stage-update",
                log,
                apply: async stage => insert(stage, "package.json", file)
            }))
        )
    );
}
