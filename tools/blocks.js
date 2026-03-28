import { readFile, writeFile, readdir, unlink } from "fs/promises";
import path from "path";
import { BlockSchema, BlockToolArgsSchema } from "../schemas.js";
import { safePath, mdParse, mdStringify } from "../utils.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
export async function listBlocks(CMS_CONTENT_DIR, arguments_) {
    const args = BlockToolArgsSchema.parse(arguments_);
    const blocksDir = safePath(CMS_CONTENT_DIR, "blocks", args.locale);
    try {
        const files = await readdir(blocksDir);
        const blocks = await Promise.all(files
            .filter(f => f.endsWith(".md"))
            .map(async (f) => {
            const content = await readFile(path.join(blocksDir, f), "utf-8");
            const { frontmatter } = mdParse(content);
            return { id: f.replace(".md", ""), title: frontmatter.title, block_type: frontmatter.block_type, active: frontmatter.active };
        }));
        return {
            content: [{ type: "text", text: JSON.stringify(blocks, null, 2) }],
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: "[]" }],
        };
    }
}
export async function getBlock(CMS_CONTENT_DIR, arguments_) {
    const args = BlockToolArgsSchema.parse(arguments_);
    if (!args.id)
        throw new McpError(ErrorCode.InvalidParams, "ID is required");
    const filePath = safePath(CMS_CONTENT_DIR, "blocks", args.locale, `${args.id}.md`);
    const fileContent = await readFile(filePath, "utf-8");
    return {
        content: [{ type: "text", text: JSON.stringify(mdParse(fileContent), null, 2) }],
    };
}
export async function createBlock(CMS_CONTENT_DIR, arguments_) {
    const args = BlockToolArgsSchema.parse(arguments_);
    if (!args.payload)
        throw new McpError(ErrorCode.InvalidParams, "Payload is required");
    const { frontmatter, body } = args.payload;
    BlockSchema.parse(frontmatter);
    const id = frontmatter.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "");
    const filePath = safePath(CMS_CONTENT_DIR, "blocks", args.locale, `${id}.md`);
    await writeFile(filePath, mdStringify(frontmatter, body), "utf-8");
    return {
        content: [{ type: "text", text: `Block ${id} created successfully.` }],
    };
}
export async function updateBlock(CMS_CONTENT_DIR, arguments_) {
    const args = BlockToolArgsSchema.parse(arguments_);
    if (!args.id || !args.payload)
        throw new McpError(ErrorCode.InvalidParams, "ID and Payload are required");
    const filePath = safePath(CMS_CONTENT_DIR, "blocks", args.locale, `${args.id}.md`);
    const { frontmatter, body } = args.payload;
    BlockSchema.parse(frontmatter);
    await writeFile(filePath, mdStringify(frontmatter, body), "utf-8");
    return {
        content: [{ type: "text", text: `Block ${args.id} updated successfully.` }],
    };
}
export async function deleteBlock(CMS_CONTENT_DIR, arguments_) {
    const args = BlockToolArgsSchema.parse(arguments_);
    if (!args.id)
        throw new McpError(ErrorCode.InvalidParams, "ID is required");
    const filePath = safePath(CMS_CONTENT_DIR, "blocks", args.locale, `${args.id}.md`);
    await unlink(filePath);
    return {
        content: [{ type: "text", text: `Block ${args.id} deleted successfully.` }],
    };
}
//# sourceMappingURL=blocks.js.map