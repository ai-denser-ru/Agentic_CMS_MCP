import { readFile, writeFile } from "fs/promises";
import path from "path";
import { SettingsArgsSchema, UpdateSettingsArgsSchema } from "../schemas.js";
import { safePath } from "../utils.js";

export async function getSettings(CMS_CONTENT_DIR: string, arguments_: any) {
  const args = SettingsArgsSchema.parse(arguments_);
  const fileName = args.setting_type === "site" ? "site.json" : `${args.setting_type}.${args.locale}.json`;
  const filePath = safePath(CMS_CONTENT_DIR, "settings", fileName);
  
  const fileContent = await readFile(filePath, "utf-8");
  return {
    content: [{ type: "text", text: fileContent }],
  };
}

export async function updateSettings(CMS_CONTENT_DIR: string, arguments_: any) {
  const args = UpdateSettingsArgsSchema.parse(arguments_);
  const id = args.setting_type === "site" ? "site" : `${args.setting_type}.${args.locale}`;
  const fileName = `${id}.json`;
  const filePath = safePath(CMS_CONTENT_DIR, "settings", fileName);
  
  // 1. Read existing data to merge (to avoid losing 'site', 'base', 'id', etc.)
  let existingData = {};
  try {
    const existingContent = await readFile(filePath, "utf-8");
    existingData = JSON.parse(existingContent);
  } catch (e) {
    console.error(`[MCP] Could not read existing settings for ${id}, starting fresh.`);
  }

  // 2. Merge: Payload overwrites existing, but 'id' is always enforced
  const finalData = {
    ...existingData,
    ...args.payload,
    id: id // Ensure id is always correct and present
  };
  
  await writeFile(filePath, JSON.stringify(finalData, null, 2), "utf-8");
  
  return {
    content: [{ type: "text", text: `Settings ${id} updated successfully (merged with existing data).` }],
  };
}
