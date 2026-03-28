import { readFile, writeFile, readdir, unlink } from "fs/promises";
import path from "path";
import { NodeSchema, NodeToolArgsSchema } from "../schemas.js";
import { safePath, mdParse, mdStringify } from "../utils.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
export async function listNodes(CMS_CONTENT_DIR, arguments_) {
    const args = NodeToolArgsSchema.parse(arguments_);
    const nodesDir = safePath(CMS_CONTENT_DIR, "nodes", args.locale);
    try {
        const files = await readdir(nodesDir);
        const nodes = await Promise.all(files
            .filter(f => f.endsWith(".md"))
            .map(async (f) => {
            const content = await readFile(path.join(nodesDir, f), "utf-8");
            const { frontmatter } = mdParse(content);
            return { id: f.replace(".md", ""), title: frontmatter.title, type: frontmatter.type, draft: frontmatter.draft };
        }));
        return {
            content: [{ type: "text", text: JSON.stringify(nodes, null, 2) }],
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: "[]" }],
        };
    }
}
export async function getNode(CMS_CONTENT_DIR, arguments_) {
    const args = NodeToolArgsSchema.parse(arguments_);
    if (!args.id)
        throw new McpError(ErrorCode.InvalidParams, "ID is required");
    const filePath = safePath(CMS_CONTENT_DIR, "nodes", args.locale, `${args.id}.md`);
    const fileContent = await readFile(filePath, "utf-8");
    return {
        content: [{ type: "text", text: JSON.stringify(mdParse(fileContent), null, 2) }],
    };
}
export async function createNode(CMS_CONTENT_DIR, arguments_) {
    const args = NodeToolArgsSchema.parse(arguments_);
    if (!args.payload)
        throw new McpError(ErrorCode.InvalidParams, "Payload is required");
    const { frontmatter, body } = args.payload;
    NodeSchema.parse(frontmatter);
    const id = frontmatter.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "");
    const filePath = safePath(CMS_CONTENT_DIR, "nodes", args.locale, `${id}.md`);
    await writeFile(filePath, mdStringify(frontmatter, body), "utf-8");
    return {
        content: [{ type: "text", text: `Node ${id} created successfully.` }],
    };
}
export async function updateNode(CMS_CONTENT_DIR, arguments_) {
    const args = NodeToolArgsSchema.parse(arguments_);
    if (!args.id || !args.payload)
        throw new McpError(ErrorCode.InvalidParams, "ID and Payload are required");
    const filePath = safePath(CMS_CONTENT_DIR, "nodes", args.locale, `${args.id}.md`);
    const { frontmatter, body } = args.payload;
    NodeSchema.parse(frontmatter);
    await writeFile(filePath, mdStringify(frontmatter, body), "utf-8");
    return {
        content: [{ type: "text", text: `Node ${args.id} updated successfully.` }],
    };
}
export async function deleteNode(CMS_CONTENT_DIR, arguments_) {
    const args = NodeToolArgsSchema.parse(arguments_);
    if (!args.id)
        throw new McpError(ErrorCode.InvalidParams, "ID is required");
    const filePath = safePath(CMS_CONTENT_DIR, "nodes", args.locale, `${args.id}.md`);
    await unlink(filePath);
    return {
        content: [{ type: "text", text: `Node ${args.id} deleted successfully.` }],
    };
}
//# sourceMappingURL=nodes.js.map