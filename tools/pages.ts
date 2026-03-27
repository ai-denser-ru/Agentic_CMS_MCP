import { readFile, writeFile, readdir, unlink } from "fs/promises";
import path from "path";
import { PageSchema, PageToolArgsSchema } from "../schemas.js";
import { safePath, mdParse, mdStringify } from "../utils.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export async function listPages(CMS_CONTENT_DIR: string, arguments_: any) {
  const args = PageToolArgsSchema.parse(arguments_);
  const pagesDir = safePath(CMS_CONTENT_DIR, "pages", args.locale);
  
  try {
    const files = await readdir(pagesDir);
    const pages = await Promise.all(
      files
        .filter(f => f.endsWith(".md"))
        .map(async (f) => {
          const content = await readFile(path.join(pagesDir, f), "utf-8");
          const { frontmatter } = mdParse(content);
          return { id: f.replace(".md", ""), title: frontmatter.title, layout: frontmatter.layout, draft: frontmatter.draft };
        })
    );
    return {
      content: [{ type: "text", text: JSON.stringify(pages, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: "[]" }],
    };
  }
}

export async function getPage(CMS_CONTENT_DIR: string, arguments_: any) {
  const args = PageToolArgsSchema.parse(arguments_);
  if (!args.id) throw new McpError(ErrorCode.InvalidParams, "ID is required");
  const filePath = safePath(CMS_CONTENT_DIR, "pages", args.locale, `${args.id}.md`);
  
  const fileContent = await readFile(filePath, "utf-8");
  return {
    content: [{ type: "text", text: JSON.stringify(mdParse(fileContent), null, 2) }],
  };
}

export async function createPage(CMS_CONTENT_DIR: string, arguments_: any) {
  const args = PageToolArgsSchema.parse(arguments_);
  if (!args.payload) throw new McpError(ErrorCode.InvalidParams, "Payload is required");
  const { frontmatter, body } = args.payload;
  PageSchema.parse(frontmatter);
  
  const id = frontmatter.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "");
  const filePath = safePath(CMS_CONTENT_DIR, "pages", args.locale, `${id}.md`);
  
  await writeFile(filePath, mdStringify(frontmatter, body), "utf-8");
  return {
    content: [{ type: "text", text: `Page ${id} created successfully.` }],
  };
}

export async function updatePage(CMS_CONTENT_DIR: string, arguments_: any) {
  const args = PageToolArgsSchema.parse(arguments_);
  if (!args.id || !args.payload) throw new McpError(ErrorCode.InvalidParams, "ID and Payload are required");
  const filePath = safePath(CMS_CONTENT_DIR, "pages", args.locale, `${args.id}.md`);
  
  const { frontmatter, body } = args.payload;
  PageSchema.parse(frontmatter);
  
  await writeFile(filePath, mdStringify(frontmatter, body), "utf-8");
  return {
    content: [{ type: "text", text: `Page ${args.id} updated successfully.` }],
  };
}

export async function deletePage(CMS_CONTENT_DIR: string, arguments_: any) {
  const args = PageToolArgsSchema.parse(arguments_);
  if (!args.id) throw new McpError(ErrorCode.InvalidParams, "ID is required");
  const filePath = safePath(CMS_CONTENT_DIR, "pages", args.locale, `${args.id}.md`);
  
  await unlink(filePath);
  return {
    content: [{ type: "text", text: `Page ${args.id} deleted successfully.` }],
  };
}
