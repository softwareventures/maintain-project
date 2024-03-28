import {argv, cwd} from "process";
import {last} from "@softwareventures/array";
import {Command} from "commander";
import pkg from "../package.json" assert {type: "json"};
import type {InitOptions} from "./init.js";
import {cliInit} from "./init.js";
import type {UpdateOptions} from "./update.js";
import {cliUpdate} from "./update.js";

export default function cli(): void {
    const program = new Command()
        .allowExcessArguments(false)
        .name(last(pkg.name.split("/")) ?? "")
        .version(pkg.version);

    program
        .command("init [destination]")
        .option("--scope <scope>")
        .option("--name <name>")
        .option("--github-owner <owner>")
        .option("--github-project <name>")
        .option("--author-name <name>")
        .option("--author-email <email>")
        .option("--license <spdx-expression>")
        .option("--copyright-holder <name>")
        .option("--webapp")
        .action(
            (destination, options) =>
                void cliInit(String(destination ?? cwd()), options as InitOptions)
        );

    program
        .command("update [path]")
        .option("--breaking")
        .action((path, options) => void cliUpdate(String(path ?? cwd()), options as UpdateOptions));

    program.parse(argv);
}
