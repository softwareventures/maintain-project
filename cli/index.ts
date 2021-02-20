import {argv, cwd} from "process";
import {last} from "@softwareventures/array";
import {Command} from "commander";
import {name, version} from "../package.json";
import {cliInit} from "./init";
import {cliUpdate} from "./update";

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
        .option("--webapp")
        .action((destination, options) => cliInit(destination ?? cwd(), options));

    program.command("update [path]").action((path, options) => cliUpdate(path ?? cwd(), options));

    program.parse(argv);
}
