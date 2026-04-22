#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);

function printHelp() {
  console.log("sd-agent CLI");
  console.log("");
  console.log("Usage:");
  console.log("  sd-agent skills list");
  console.log("  sd-agent skills path");
}

if (args.length === 0 || args[0] === "help" || args[0] === "--help" || args[0] === "-h") {
  printHelp();
  process.exit(0);
}

if (args[0] === "skills" && args[1] === "list") {
  const skillsRoot = path.join(root, "skills");
  const groups = fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();

  groups.forEach(group => console.log(group));
  process.exit(0);
}

if (args[0] === "skills" && args[1] === "path") {
  console.log(path.join(root, "skills"));
  process.exit(0);
}

printHelp();
process.exit(1);
