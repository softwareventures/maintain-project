import {argv, cwd} from "process";
import {last} from "@softwareventures/array";
import {Command} from "commander";
import {name, version} from "../package.json";
import {cliInit} from "./init";

export default function cli(): void {
    new Command()
        .storeOptionsAsProperties(false)
        .passCommandToAction(false)
        .name(last(name.split("/")) ?? "")
        .version(version)
        .arguments("[destination]")
        .option("--scope <scope>")
        .option("--name <name>")
        .option("--github-owner <owner>")
        .option("--github-project <name>")
        .action((destination, options) => cliInit(destination ?? cwd(), options))
        .parse(argv);
}
