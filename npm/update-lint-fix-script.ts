import {mapNull, mapNullable, mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import {equal as arraysEqual, excludeNull, mapFn} from "@softwareventures/array";
import type {Project} from "../project/project.js";
import type {FsStageUpdate} from "../project/update.js";
import {isTypescriptProject} from "../typescript/is-typescript-project.js";
import {readTsconfig} from "../typescript/read-tsconfig.js";
import {isSuccess, mapResultFn, toNullable} from "../result/result.js";
import {isPrettierProject} from "../prettier/is-prettier-project.js";
import {findExtract} from "../collections/arrays.js";
import {insert} from "../fs-stage/fs-stage.js";
import {modifyProjectScript} from "./modify-script.js";
import {readProjectScript} from "./read-script.js";

export async function updateLintFixScript(
    project: Project,
    script: "lint" | "fix"
): Promise<FsStageUpdate | null> {
    const existingScript = readProjectScript(project, script);

    const isTypeScript = isTypescriptProject(project);
    const tsconfig = isTypeScript.then(async isTypeScript =>
        isTypeScript ? readTsconfig(project) : null
    );
    const isTsNoEmit = tsconfig
        .then(mapNullableFn(mapResultFn(tsconfig => tsconfig.options.noEmit)))
        .then(result => result != null && isSuccess(result) && result.value)
        .then(value => value ?? false);

    const isPrettier = isPrettierProject(project);

    const commands = existingScript
        .then(mapNullableFn(script => script.split("&&")))
        .then(mapNullableFn(mapFn(command => command.trim())))
        .then(mapNullFn(() => []));

    const newCommands = commands
        .then(async commands => {
            const [existingTscCommand, commands2] = findExtract(commands, command =>
                Boolean(command.match(/^tsc(\s|$)/u))
            );
            const [existingEslintCommand, commands3] = findExtract(commands2, command =>
                Boolean(command.match(/^eslint(\s|$)/u))
            );
            const [existingTslintCommand, commands4] = findExtract(commands3, command =>
                Boolean(command.match(/^tslint(\s|$)/u))
            );
            const [existingPrettierCommand, commands5] = findExtract(commands4, command =>
                Boolean(command.match(/^prettier(\s|$)/u))
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

            const eslintCommand = mapNull(existingEslintCommand, () =>
                mapNullable(project.eslint, () =>
                    script === "fix" ? "eslint --fix ." : "eslint ."
                )
            );

            const tslintCommand = mapNull(existingTslintCommand, () =>
                mapNullable(project.tslint, () =>
                    script === "fix" ? "tslint --fix --project ." : "tslint --project ."
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
