import {mapNull, mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import {contains, excludeNull, mapFn} from "@softwareventures/array";
import {ProjectSource} from "../project/project";
import {readTsconfig} from "../typescript/read-tsconfig";
import {isTypescriptProject} from "../typescript/is-typescript-project";
import {isSuccess, mapResultFn, toNullable} from "../result/result";
import {isPrettierProject} from "../prettier/is-prettier-project";
import {isEslintProject} from "../eslint/is-eslint-project";
import {arraysEqual, findExtract} from "../collections/arrays";
import {insert} from "../fs-stage/fs-stage";
import {FsStageUpdate} from "../project/update";
import {readProjectScript} from "./read-script";
import {modifyProjectScript} from "./modify-script";

export async function updateFixScript(project: ProjectSource): Promise<FsStageUpdate | null> {
    const existingFixScript = readProjectScript(project, "fix");

    const isTypeScript = isTypescriptProject(project);
    const tsconfig = isTypeScript.then(isTypeScript =>
        isTypeScript ? readTsconfig(project) : null
    );
    const isTsNoEmit = tsconfig
        .then(mapNullableFn(mapResultFn(tsconfig => tsconfig.options.noEmit)))
        .then(result => result != null && isSuccess(result) && result.value);

    const isPrettier = isPrettierProject(project);
    const isEslint = isEslintProject(project);

    const commands = existingFixScript
        .then(mapNullableFn(script => script.split("&&")))
        .then(mapNullableFn(mapFn(command => command.trim())))
        .then(mapNullFn(() => []));

    const newCommands = commands
        .then(async commands => {
            const [existingTscCommand, commands2] = findExtract(
                commands,
                command => !!command.match(/^tsc(\s|$)/)
            );
            const [existingEslintFixCommand, commands3] = findExtract(commands2, command => {
                const args = command.split(/\s+/);
                return args[0] === "eslint" && contains(args, "--fix");
            });
            const [existingPrettierWriteCommand, commands4] = findExtract(commands3, command => {
                const args = command.split(/\s+/);
                return (
                    args[0] === "prettier" && (contains(args, "-w") || contains(args, "--write"))
                );
            });

            const tscCommand = Promise.resolve(
                mapNull(existingTscCommand, async () =>
                    Promise.all([isTypeScript, isTsNoEmit]).then(([isTypeScript, isTsNoEmit]) =>
                        isTypeScript ? (isTsNoEmit ? "tsc" : "tsc --noEmit") : null
                    )
                )
            );

            const prettierCommand = Promise.resolve(
                mapNull(existingPrettierWriteCommand, async () =>
                    isPrettier.then(isPrettier => (isPrettier ? "prettier --write ." : null))
                )
            );

            const eslintCommand = Promise.resolve(
                mapNull(existingEslintFixCommand, async () =>
                    isEslint.then(isEslint => (isEslint ? "eslint --fix ." : null))
                )
            );

            return Promise.all([tscCommand, prettierCommand, eslintCommand])
                .then(([tscCommand, prettierCommand, eslintCommand]) => [
                    tscCommand,
                    eslintCommand,
                    prettierCommand,
                    ...commands4
                ])
                .then(excludeNull);
        })
        .then(async newCommands =>
            commands.then(commands => (arraysEqual(commands, newCommands) ? null : newCommands))
        );

    const log = commands.then(commands =>
        commands.length === 0
            ? "build(npm): add missing fix script"
            : "build(npm): update fix script"
    );

    const file = newCommands
        .then(
            mapNullableFn(async commands =>
                modifyProjectScript(project, "fix", () => commands.join(" && "))
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
