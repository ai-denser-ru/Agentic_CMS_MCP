import { readFile, writeFile } from "fs/promises";
import path from "path";
import { SettingsArgsSchema, UpdateSettingsArgsSchema } from "../schemas.js";
import { safePath } from "../utils.js";
export async function getSettings(CMS_CONTENT_DIR, arguments_) {
    const args = SettingsArgsSchema.parse(arguments_);
    const fileName = args.setting_type === "site" ? "site.json" : `${args.setting_type}.${args.locale}.json`;
    const filePath = safePath(CMS_CONTENT_DIR, "settings", fileName);
    const fileContent = await readFile(filePath, "utf-8");
    return {
        content: [{ type: "text", text: fileContent }],
    };
}
export async function updateSettings(CMS_CONTENT_DIR, arguments_) {
    const args = UpdateSettingsArgsSchema.parse(arguments_);
    const fileName = args.setting_type === "site" ? "site.json" : `${args.setting_type}.${args.locale}.json`;
    const filePath = safePath(CMS_CONTENT_DIR, "settings", fileName);
    await writeFile(filePath, JSON.stringify(args.payload, null, 2), "utf-8");
    return {
        content: [{ type: "text", text: `Settings ${args.setting_type}${args.setting_type === 'site' ? '' : '.' + args.locale} updated successfully.` }],
    };
}
//# sourceMappingURL=settings.js.map