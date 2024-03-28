#!/usr/bin/env node
import {pathToFileURL} from "node:url";
import cli from "./cli/index.js";

const execPath = process.argv[1];

if (execPath != null && import.meta.url === pathToFileURL(execPath).href) {
    cli();
}
