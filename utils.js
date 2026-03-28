import path from "path";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import matter from "gray-matter";
export function safePath(base, ...segments) {
    const resolved = path.resolve(base, ...segments);
    const normalizedBase = path.resolve(base);
    if (!resolved.startsWith(normalizedBase)) {
        throw new McpError(ErrorCode.InvalidParams, `Path traversal detected: ${resolved} is outside of ${normalizedBase}`);
    }
    return resolved;
}
export function mdParse(content) {
    const { data, content: body } = matter(content);
    return { frontmatter: data, body: body.trim() };
}
export function mdStringify(frontmatter, body) {
    return matter.stringify(body, frontmatter);
}
//# sourceMappingURL=utils.js.map