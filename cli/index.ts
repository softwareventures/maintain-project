import {argv, cwd} from "process";
import {last} from "@softwareventures/array";
import {Command} from "commander";
import {name, version} from "../package.json";
import {cliInit} from "./init";

export default function cli() {
    new Command()
        .storeOptionsAsProperties(false)
        .passCommandToAction(false)
        .name(last(name.split("/")) ?? "")
        .version(version)
        .arguments("[destination]")
        .action(destination => cliInit(destination ?? cwd()))
        .parse(argv);
}