#!/usr/bin/env node
import {pathToFileURL} from "url";
import {resolve} from "path";
import cli from "./cli/index.js";

const execPath = process.argv[1];

if (
    execPath != null &&
    (import.meta.url === pathToFileURL(execPath).href ||
        import.meta.url === pathToFileURL(resolve(execPath, "index.js")).href)
) {
    cli();
}
