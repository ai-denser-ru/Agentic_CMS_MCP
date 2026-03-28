import { readFile, writeFile, readdir, unlink } from "fs/promises";
import path from "path";
import { StaffSchema, StaffToolArgsSchema } from "../schemas.js";
import { safePath, mdParse, mdStringify } from "../utils.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export async function listStaff(CMS_CONTENT_DIR: string, arguments_: any) {
  const args = StaffToolArgsSchema.parse(arguments_);
  const staffDir = safePath(CMS_CONTENT_DIR, "staff", args.locale);
  
  try {
    const files = await readdir(staffDir);
    const staff = await Promise.all(
      files
        .filter(f => f.endsWith(".md"))
        .map(async (f) => {
          const content = await readFile(path.join(staffDir, f), "utf-8");
          const { frontmatter } = mdParse(content);
          return { id: f.replace(".md", ""), title: frontmatter.title, role: frontmatter.role, order: frontmatter.order };
        })
    );
    return {
      content: [{ type: "text", text: JSON.stringify(staff, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: "[]" }],
    };
  }
}

export async function getStaff(CMS_CONTENT_DIR: string, arguments_: any) {
  const args = StaffToolArgsSchema.parse(arguments_);
  if (!args.id) throw new McpError(ErrorCode.InvalidParams, "ID is required");
  const filePath = safePath(CMS_CONTENT_DIR, "staff", args.locale, `${args.id}.md`);
  
  const fileContent = await readFile(filePath, "utf-8");
  return {
    content: [{ type: "text", text: JSON.stringify(mdParse(fileContent), null, 2) }],
  };
}

export async function createStaff(CMS_CONTENT_DIR: string, arguments_: any) {
  const args = StaffToolArgsSchema.parse(arguments_);
  if (!args.payload) throw new McpError(ErrorCode.InvalidParams, "Payload is required");
  const { frontmatter, body } = args.payload;
  StaffSchema.parse(frontmatter);
  
  const id = frontmatter.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "");
  const filePath = safePath(CMS_CONTENT_DIR, "staff", args.locale, `${id}.md`);
  
  await writeFile(filePath, mdStringify(frontmatter, body), "utf-8");
  return {
    content: [{ type: "text", text: `Staff member ${id} created successfully.` }],
  };
}

export async function updateStaff(CMS_CONTENT_DIR: string, arguments_: any) {
  const args = StaffToolArgsSchema.parse(arguments_);
  if (!args.id || !args.payload) throw new McpError(ErrorCode.InvalidParams, "ID and Payload are required");
  const filePath = safePath(CMS_CONTENT_DIR, "staff", args.locale, `${args.id}.md`);
  
  const { frontmatter, body } = args.payload;
  StaffSchema.parse(frontmatter);
  
  await writeFile(filePath, mdStringify(frontmatter, body), "utf-8");
  return {
    content: [{ type: "text", text: `Staff member ${args.id} updated successfully.` }],
  };
}

export async function deleteStaff(CMS_CONTENT_DIR: string, arguments_: any) {
  const args = StaffToolArgsSchema.parse(arguments_);
  if (!args.id) throw new McpError(ErrorCode.InvalidParams, "ID is required");
  const filePath = safePath(CMS_CONTENT_DIR, "staff", args.locale, `${args.id}.md`);
  
  await unlink(filePath);
  return {
    content: [{ type: "text", text: `Staff member ${args.id} deleted successfully.` }],
  };
}
