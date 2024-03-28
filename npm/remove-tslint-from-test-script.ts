import {mapNullable, mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import {mapFn} from "@softwareventures/array";
import type {FsStageUpdate} from "../project/update.js";
import type {ProjectSource} from "../project/project.js";
import {findExtract} from "../collections/arrays.js";
import {toNullable} from "../result/result.js";
import {insert} from "../fs-stage/fs-stage.js";
import {readProjectScript} from "./read-script.js";
import {modifyProjectScript} from "./modify-script.js";

export async function removeTslintFromTestScript(
    project: ProjectSource
): Promise<FsStageUpdate | null> {
    const existingScript = readProjectScript(project, "test");

    const commands = existingScript
        .then(mapNullableFn(script => script.split("&&")))
        .then(mapNullableFn(mapFn(command => command.trim())))
        .then(mapNullFn(() => []));

    const newCommands = commands
        .then(commands => {
            const [tslintCommand, newCommands] = findExtract(commands, command =>
                Boolean(command.match(/^tslint(\s|$)/u))
            );
            return mapNullable(tslintCommand, () => newCommands);
        })
        .then(
            mapNullableFn(commands => (commands.length === 0 ? ["echo No tests yet"] : commands))
        );

    const file = newCommands
        .then(
            mapNullableFn(async commands =>
                modifyProjectScript(project, "test", () => commands.join(" && "))
            )
        )
        .then(mapNullableFn(toNullable));

    return file.then(
        mapNullableFn(file => ({
            type: "fs-stage-update",
            log: "build(npm): remove tslint from test script",
            apply: async stage => insert(stage, "package.json", file)
        }))
    );
}
