import {argv, cwd} from "process";
import {last} from "@softwareventures/array";
import {Command} from "commander";
import {name, version} from "../package.json";
import {cliInit, InitOptions} from "./init";
import {cliUpdate, UpdateOptions} from "./update";

export default function cli(): void {
    const program = new Command()
        .allowExcessArguments(false)
        .name(last(name.split("/")) ?? "")
        .version(version);

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
        .action((destination, options) =>
            cliInit(String(destination ?? cwd()), options as InitOptions)
        );

    program
        .command("update [path]")
        .option("--breaking")
        .action((path, options) => cliUpdate(String(path ?? cwd()), options as UpdateOptions));

    program.parse(argv);
}
