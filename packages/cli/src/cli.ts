#!/usr/bin/env node
import { defaultContext } from "./context.js";
import { main } from "./main.js";

process.exitCode = main(process.argv.slice(2), defaultContext(process.cwd()));
