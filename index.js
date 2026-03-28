import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError, } from "@modelcontextprotocol/sdk/types.js";
import path from "path";
import { getSettings, updateSettings } from "./tools/settings.js";
import { listNodes, getNode, createNode, updateNode, deleteNode } from "./tools/nodes.js";
import { listPages, getPage, createPage, updatePage, deletePage } from "./tools/pages.js";
import { listBlocks, getBlock, createBlock, updateBlock, deleteBlock } from "./tools/blocks.js";
import { listTaxonomy, getTerm, createTerm, updateTerm, deleteTerm } from "./tools/taxonomy.js";
import { listStaff, getStaff, createStaff, updateStaff, deleteStaff } from "./tools/staff.js";
import { verifyBuild, getGitStatus, rollbackChanges, gitCommit, gitPush, getPreviewUrl } from "./tools/system.js";
// Путь к директории с настройками вашей Astro CMS
const CMS_CONTENT_DIR = path.join(process.cwd(), "../Agentic_CMS_Site/src/content");
// 1. Инициализация сервера
const server = new Server({
    name: "agentic-cms-mcp",
    version: "0.4.0",
}, {
    capabilities: {
        tools: {},
    },
});
// 2. Регистрация доступных инструментов
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            // Settings
            {
                name: "get_settings",
                description: "Возвращает текущую JSON конфигурацию сайта (business, navigation, site).",
                inputSchema: {
                    type: "object",
                    properties: {
                        setting_type: { type: "string", enum: ["business", "navigation", "site"] },
                        locale: { type: "string", description: "Код языка (например, ru, en)" },
                    },
                    required: ["setting_type"],
                },
            },
            {
                name: "update_settings",
                description: "Обновляет JSON файл настроек. В payload необходимо передать ПОЛНЫЙ объект настроек.",
                inputSchema: {
                    type: "object",
                    properties: {
                        setting_type: { type: "string", enum: ["business", "navigation", "site"] },
                        locale: { type: "string" },
                        payload: { type: "object" },
                    },
                    required: ["setting_type", "payload"],
                },
            },
            // Nodes
            {
                name: "list_nodes",
                description: "Возвращает список узлов (новости, услуги и т.д.) для указанной локали.",
                inputSchema: {
                    type: "object",
                    properties: {
                        locale: { type: "string", default: "ru" },
                    },
                },
            },
            {
                name: "get_node",
                description: "Возвращает данные конкретного узла по ID.",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                    },
                    required: ["id"],
                },
            },
            {
                name: "create_node",
                description: "Создает новый узел.",
                inputSchema: {
                    type: "object",
                    properties: {
                        locale: { type: "string", default: "ru" },
                        payload: {
                            type: "object",
                            properties: {
                                frontmatter: { type: "object" },
                                body: { type: "string" },
                            },
                            required: ["frontmatter", "body"],
                        },
                    },
                    required: ["payload"],
                },
            },
            {
                name: "update_node",
                description: "Обновляет существующий узел.",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                        payload: {
                            type: "object",
                            properties: {
                                frontmatter: { type: "object" },
                                body: { type: "string" },
                            },
                            required: ["frontmatter", "body"],
                        },
                    },
                    required: ["id", "payload"],
                },
            },
            {
                name: "delete_node",
                description: "Удаляет узел (ДЕСТРУКТИВНОЕ ДЕЙСТВИЕ, ТРЕБУЕТ ПОДТВЕРЖДЕНИЯ).",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                    },
                    required: ["id"],
                },
            },
            // Pages
            {
                name: "list_pages",
                description: "Возвращает список структурных страниц.",
                inputSchema: {
                    type: "object",
                    properties: {
                        locale: { type: "string", default: "ru" },
                    },
                },
            },
            {
                name: "get_page",
                description: "Возвращает данные конкретной страницы.",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                    },
                    required: ["id"],
                },
            },
            {
                name: "create_page",
                description: "Создает новую страницу.",
                inputSchema: {
                    type: "object",
                    properties: {
                        locale: { type: "string", default: "ru" },
                        payload: {
                            type: "object",
                            properties: {
                                frontmatter: { type: "object" },
                                body: { type: "string" },
                            },
                            required: ["frontmatter", "body"],
                        },
                    },
                    required: ["payload"],
                },
            },
            {
                name: "update_page",
                description: "Обновляет существующую страницу.",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                        payload: {
                            type: "object",
                            properties: {
                                frontmatter: { type: "object" },
                                body: { type: "string" },
                            },
                            required: ["frontmatter", "body"],
                        },
                    },
                    required: ["id", "payload"],
                },
            },
            {
                name: "delete_page",
                description: "Удаляет страницу (ДЕСТРУКТИВНОЕ ДЕЙСТВИЕ, ТРЕБУЕТ ПОДТВЕРЖДЕНИЯ).",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                    },
                    required: ["id"],
                },
            },
            // Blocks
            {
                name: "list_blocks",
                description: "Возвращает список блоков для указанной локали.",
                inputSchema: {
                    type: "object",
                    properties: {
                        locale: { type: "string", default: "ru" },
                    },
                },
            },
            {
                name: "get_block",
                description: "Возвращает данные конкретного блока по ID.",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                    },
                    required: ["id"],
                },
            },
            {
                name: "create_block",
                description: "Создает новый блок.",
                inputSchema: {
                    type: "object",
                    properties: {
                        locale: { type: "string", default: "ru" },
                        payload: {
                            type: "object",
                            properties: {
                                frontmatter: { type: "object" },
                                body: { type: "string" },
                            },
                            required: ["frontmatter", "body"],
                        },
                    },
                    required: ["payload"],
                },
            },
            {
                name: "update_block",
                description: "Обновляет существующий блок.",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                        payload: {
                            type: "object",
                            properties: {
                                frontmatter: { type: "object" },
                                body: { type: "string" },
                            },
                            required: ["frontmatter", "body"],
                        },
                    },
                    required: ["id", "payload"],
                },
            },
            {
                name: "delete_block",
                description: "Удаляет блок (ДЕСТРУКТИВНОЕ ДЕЙСТВИЕ, ТРЕБУЕТ ПОДТВЕРЖДЕНИЯ).",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                    },
                    required: ["id"],
                },
            },
            // Taxonomy
            {
                name: "list_taxonomy",
                description: "Возвращает список терминов таксономии для указанной локали.",
                inputSchema: {
                    type: "object",
                    properties: {
                        locale: { type: "string", default: "ru" },
                    },
                },
            },
            {
                name: "get_term",
                description: "Возвращает данные конкретного термина таксономии по ID.",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                    },
                    required: ["id"],
                },
            },
            {
                name: "create_term",
                description: "Создает новый термин таксономии.",
                inputSchema: {
                    type: "object",
                    properties: {
                        locale: { type: "string", default: "ru" },
                        payload: {
                            type: "object",
                            properties: {
                                frontmatter: { type: "object" },
                                body: { type: "string" },
                            },
                            required: ["frontmatter", "body"],
                        },
                    },
                    required: ["payload"],
                },
            },
            {
                name: "update_term",
                description: "Обновляет существующий термин таксономии.",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                        payload: {
                            type: "object",
                            properties: {
                                frontmatter: { type: "object" },
                                body: { type: "string" },
                            },
                            required: ["frontmatter", "body"],
                        },
                    },
                    required: ["id", "payload"],
                },
            },
            {
                name: "delete_term",
                description: "Удаляет термин таксономии (ДЕСТРУКТИВНОЕ ДЕЙСТВИЕ, ТРЕБУЕТ ПОДТВЕРЖДЕНИЯ).",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                    },
                    required: ["id"],
                },
            },
            // Staff
            {
                name: "list_staff",
                description: "Возвращает список сотрудников для указанной локали.",
                inputSchema: {
                    type: "object",
                    properties: {
                        locale: { type: "string", default: "ru" },
                    },
                },
            },
            {
                name: "get_staff",
                description: "Возвращает данные конкретного сотрудника по ID.",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                    },
                    required: ["id"],
                },
            },
            {
                name: "create_staff",
                description: "Создает нового сотрудника.",
                inputSchema: {
                    type: "object",
                    properties: {
                        locale: { type: "string", default: "ru" },
                        payload: {
                            type: "object",
                            properties: {
                                frontmatter: { type: "object" },
                                body: { type: "string" },
                            },
                            required: ["frontmatter", "body"],
                        },
                    },
                    required: ["payload"],
                },
            },
            {
                name: "update_staff",
                description: "Обновляет существующего сотрудника.",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                        payload: {
                            type: "object",
                            properties: {
                                frontmatter: { type: "object" },
                                body: { type: "string" },
                            },
                            required: ["frontmatter", "body"],
                        },
                    },
                    required: ["id", "payload"],
                },
            },
            {
                name: "delete_staff",
                description: "Удаляет сотрудника (ДЕСТРУКТИВНОЕ ДЕЙСТВИЕ, ТРЕБУЕТ ПОДТВЕРЖДЕНИЯ).",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        locale: { type: "string", default: "ru" },
                    },
                    required: ["id"],
                },
            },
            // System Tools
            {
                name: "verify_build",
                description: "Запускает `npm run build` для проверки корректности сайта.",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "get_git_status",
                description: "Возвращает список измененных файлов (git status --short).",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "rollback_changes",
                description: "Откатывает все незакоммиченные изменения (git checkout .).",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "git_commit",
                description: "Создает коммит в репозитории сайта.",
                inputSchema: {
                    type: "object",
                    properties: {
                        message: { type: "string", description: "Сообщение коммита" },
                    },
                    required: ["message"],
                },
            },
            {
                name: "git_push",
                description: "Отправляет коммиты на GitHub (ветка main).",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "get_preview_url",
                description: "Генерирует временную публичную ссылку для предпросмотра сайта.",
                inputSchema: { type: "object", properties: {} },
            },
        ],
    };
});
// 3. Обработка вызовов инструментов
server.setRequestHandler(CallToolRequestSchema, (async (request) => {
    const { name, arguments: args } = request.params;
    console.error(`[MCP] Calling tool: ${name}`, args || {});
    try {
        switch (name) {
            case "get_settings": return await getSettings(CMS_CONTENT_DIR, args);
            case "update_settings": return await updateSettings(CMS_CONTENT_DIR, args);
            case "list_nodes": return await listNodes(CMS_CONTENT_DIR, args);
            case "get_node": return await getNode(CMS_CONTENT_DIR, args);
            case "create_node": return await createNode(CMS_CONTENT_DIR, args);
            case "update_node": return await updateNode(CMS_CONTENT_DIR, args);
            case "delete_node": return await deleteNode(CMS_CONTENT_DIR, args);
            case "list_pages": return await listPages(CMS_CONTENT_DIR, args);
            case "get_page": return await getPage(CMS_CONTENT_DIR, args);
            case "create_page": return await createPage(CMS_CONTENT_DIR, args);
            case "update_page": return await updatePage(CMS_CONTENT_DIR, args);
            case "delete_page": return await deletePage(CMS_CONTENT_DIR, args);
            case "list_blocks": return await listBlocks(CMS_CONTENT_DIR, args);
            case "get_block": return await getBlock(CMS_CONTENT_DIR, args);
            case "create_block": return await createBlock(CMS_CONTENT_DIR, args);
            case "update_block": return await updateBlock(CMS_CONTENT_DIR, args);
            case "delete_block": return await deleteBlock(CMS_CONTENT_DIR, args);
            case "list_taxonomy": return await listTaxonomy(CMS_CONTENT_DIR, args);
            case "get_term": return await getTerm(CMS_CONTENT_DIR, args);
            case "create_term": return await createTerm(CMS_CONTENT_DIR, args);
            case "update_term": return await updateTerm(CMS_CONTENT_DIR, args);
            case "delete_term": return await deleteTerm(CMS_CONTENT_DIR, args);
            case "list_staff": return await listStaff(CMS_CONTENT_DIR, args);
            case "get_staff": return await getStaff(CMS_CONTENT_DIR, args);
            case "create_staff": return await createStaff(CMS_CONTENT_DIR, args);
            case "update_staff": return await updateStaff(CMS_CONTENT_DIR, args);
            case "delete_staff": return await deleteStaff(CMS_CONTENT_DIR, args);
            case "verify_build": return await verifyBuild(CMS_CONTENT_DIR);
            case "get_git_status": return await getGitStatus(CMS_CONTENT_DIR);
            case "rollback_changes": return await rollbackChanges(CMS_CONTENT_DIR);
            case "git_commit": return await gitCommit(CMS_CONTENT_DIR, args);
            case "git_push": return await gitPush(CMS_CONTENT_DIR);
            case "get_preview_url": return await getPreviewUrl(CMS_CONTENT_DIR);
            default:
                throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`);
        }
    }
    catch (error) {
        if (error instanceof McpError)
            throw error;
        return {
            content: [{ type: "text", text: `Error: ${String(error)}` }],
            isError: true,
        };
    }
}));
// 4. Запуск сервера
async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Agentic CMS MCP Server (v0.4.0) running on stdio");
}
run().catch(console.error);
//# sourceMappingURL=index.js.map