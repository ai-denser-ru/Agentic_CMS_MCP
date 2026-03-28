export declare function safePath(base: string, ...segments: string[]): string;
export declare function mdParse(content: string): {
    frontmatter: {
        [key: string]: any;
    };
    body: string;
};
export declare function mdStringify(frontmatter: any, body: string): string;
//# sourceMappingURL=utils.d.ts.map