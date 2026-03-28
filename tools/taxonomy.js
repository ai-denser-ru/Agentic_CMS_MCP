import { readFile, writeFile, readdir, unlink } from "fs/promises";
import path from "path";
import { TaxonomySchema, TaxonomyToolArgsSchema } from "../schemas.js";
import { safePath, mdParse, mdStringify } from "../utils.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
export async function listTaxonomy(CMS_CONTENT_DIR, arguments_) {
    const args = TaxonomyToolArgsSchema.parse(arguments_);
    const taxonomyDir = safePath(CMS_CONTENT_DIR, "taxonomy", args.locale);
    try {
        const files = await readdir(taxonomyDir);
        const taxonomy = await Promise.all(files
            .filter(f => f.endsWith(".md"))
            .map(async (f) => {
            const content = await readFile(path.join(taxonomyDir, f), "utf-8");
            const { frontmatter } = mdParse(content);
            return { id: f.replace(".md", ""), title: frontmatter.title, vocabulary: frontmatter.vocabulary };
        }));
        return {
            content: [{ type: "text", text: JSON.stringify(taxonomy, null, 2) }],
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: "[]" }],
        };
    }
}
export async function getTerm(CMS_CONTENT_DIR, arguments_) {
    const args = TaxonomyToolArgsSchema.parse(arguments_);
    if (!args.id)
        throw new McpError(ErrorCode.InvalidParams, "ID is required");
    const filePath = safePath(CMS_CONTENT_DIR, "taxonomy", args.locale, `${args.id}.md`);
    const fileContent = await readFile(filePath, "utf-8");
    return {
        content: [{ type: "text", text: JSON.stringify(mdParse(fileContent), null, 2) }],
    };
}
export async function createTerm(CMS_CONTENT_DIR, arguments_) {
    const args = TaxonomyToolArgsSchema.parse(arguments_);
    if (!args.payload)
        throw new McpError(ErrorCode.InvalidParams, "Payload is required");
    const { frontmatter, body } = args.payload;
    TaxonomySchema.parse(frontmatter);
    const id = frontmatter.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "");
    const filePath = safePath(CMS_CONTENT_DIR, "taxonomy", args.locale, `${id}.md`);
    await writeFile(filePath, mdStringify(frontmatter, body), "utf-8");
    return {
        content: [{ type: "text", text: `Taxonomy term ${id} created successfully.` }],
    };
}
export async function updateTerm(CMS_CONTENT_DIR, arguments_) {
    const args = TaxonomyToolArgsSchema.parse(arguments_);
    if (!args.id || !args.payload)
        throw new McpError(ErrorCode.InvalidParams, "ID and Payload are required");
    const filePath = safePath(CMS_CONTENT_DIR, "taxonomy", args.locale, `${args.id}.md`);
    const { frontmatter, body } = args.payload;
    TaxonomySchema.parse(frontmatter);
    await writeFile(filePath, mdStringify(frontmatter, body), "utf-8");
    return {
        content: [{ type: "text", text: `Taxonomy term ${args.id} updated successfully.` }],
    };
}
export async function deleteTerm(CMS_CONTENT_DIR, arguments_) {
    const args = TaxonomyToolArgsSchema.parse(arguments_);
    if (!args.id)
        throw new McpError(ErrorCode.InvalidParams, "ID is required");
    const filePath = safePath(CMS_CONTENT_DIR, "taxonomy", args.locale, `${args.id}.md`);
    await unlink(filePath);
    return {
        content: [{ type: "text", text: `Taxonomy term ${args.id} deleted successfully.` }],
    };
}
//# sourceMappingURL=taxonomy.js.map