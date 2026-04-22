#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);

function printHelp() {
  console.log("\n🚀 sd-agent CLI");
  console.log("\nUsage:");
  console.log("  sd-agent skills list              - List skill groups");
  console.log("  sd-agent skills path              - Print skills folder path");
  console.log("  sd-agent chat portal              - Prepare prompt for portal init in Chat");
  console.log("  sd-agent chat module              - Prepare prompt for module init in Chat");
  console.log("  sd-agent chat entity              - Prepare prompt for entity CRUD in Chat");
  console.log("  sd-agent portal init [name]       - Interactive portal initialization");
  console.log("  sd-agent help                     - Show this help\n");
}

function getPrompt(type) {
  const promptsDir = path.join(root, ".github/prompts");
  const mapping = {
    portal: "sdcorejs-angular-portal.prompt.md",
    module: "sdcorejs-angular-portal.prompt.md",
    entity: "sdcorejs-angular-portal.prompt.md"
  };
  const file = mapping[type];
  if (!file) return null;
  const filePath = path.join(promptsDir, file);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
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

if (args[0] === "chat") {
  const type = args[1]; // portal, module, entity
  const prompt = getPrompt(type);
  if (!prompt) {
    console.error(`❌ Unknown chat type: ${type}`);
    console.log("Valid types: portal, module, entity");
    process.exit(1);
  }
  console.log("\n📋 Copy this prompt into VS Code Chat:\n");
  console.log("─".repeat(80));
  console.log(prompt);
  console.log("─".repeat(80));
  console.log("\n✅ Prompt copied. Paste it into Chat and replace {{input}} with your request.\n");
  process.exit(0);
}

if (args[0] === "portal" && args[1] === "init") {
  const name = args[2] || "my-portal";
  console.log(`\n🚀 Portal initialization for: ${name}`);
  console.log("\nUsage in Chat:");
  console.log(`  1. Run: sd-agent chat portal`);
  console.log(`  2. Copy the prompt into VS Code Chat`);
  console.log(`  3. Replace {{input}} with: Khởi tạo portal ${name} với dev, qc, uat, prod`);
  console.log("\nOr use interactive setup (coming soon)\n");
  process.exit(0);
}

if (args[0] === "module" && args[1] === "init") {
  const module = args[2] || "mymodule";
  console.log(`\n🚀 Module initialization for: ${module}`);
  console.log("\nUsage in Chat:");
  console.log(`  1. Run: sd-agent chat module`);
  console.log(`  2. Copy the prompt into VS Code Chat`);
  console.log(`  3. Replace {{input}} with: Tạo module ${module} cho portal\n`);
  process.exit(0);
}

if (args[0] === "entity" && args[1] === "init") {
  const entity = args[2] || "product";
  console.log(`\n🚀 Entity initialization for: ${entity}`);
  console.log("\nUsage in Chat:");
  console.log(`  1. Run: sd-agent chat entity`);
  console.log(`  2. Copy the prompt into VS Code Chat`);
  console.log(`  3. Replace {{input}} with: Thêm entity ${entity} vào module\n`);
  process.exit(0);
}

printHelp();
process.exit(1);
