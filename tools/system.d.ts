/**
 * Запускает сборку сайта для проверки корректности изменений.
 */
export declare function verifyBuild(siteDir: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: never;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
/**
 * Возвращает статус Git для отслеживания измененных файлов.
 */
export declare function getGitStatus(siteDir: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: never;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
/**
 * Выполняет откат всех незакоммиченных изменений.
 */
export declare function rollbackChanges(siteDir: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: never;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
/**
 * Фиксирует изменения в Git (git add . && git commit -m "...").
 */
export declare function gitCommit(siteDir: string, args: any): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: never;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
/**
 * Отправляет изменения на GitHub (git push origin main).
 */
export declare function gitPush(siteDir: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: never;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
/**
 * Запускает временный веб-превью через localtunnel.
 */
export declare function getPreviewUrl(siteDir: string): Promise<unknown>;
//# sourceMappingURL=system.d.ts.map