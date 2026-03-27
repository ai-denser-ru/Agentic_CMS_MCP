import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { readFile, writeFile } from "fs/promises";
import path from "path";

// Путь к директории с настройками вашей Astro CMS
// В проде это будет браться из переменных окружения
const CMS_CONTENT_DIR = path.join(process.cwd(), "../Agentic_CMS/src/content");

// 1. Инициализация сервера
const server = new Server(
  {
    name: "agentic-cms-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 2. Zod-схемы для аргументов инструментов (совпадают с Astro)
const SettingsArgsSchema = z.object({
  setting_type: z.enum(["business", "navigation", "site"]),
  locale: z.string().default("ru"),
});

const UpdateSettingsArgsSchema = z.object({
  setting_type: z.enum(["business", "navigation", "site"]),
  locale: z.string().default("ru"),
  payload: z.any(),
});

// 3. Регистрация доступных инструментов
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
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
    ],
  };
});

// 4. Обработка вызовов инструментов
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (request.params.name === "get_settings") {
      const args = SettingsArgsSchema.parse(request.params.arguments);
      const fileName = args.setting_type === "site" ? "site.json" : `${args.setting_type}.${args.locale}.json`;
      const filePath = path.join(CMS_CONTENT_DIR, "settings", fileName);
      
      const fileContent = await readFile(filePath, "utf-8");
      return {
        content: [{ type: "text", text: fileContent }],
      };
    }

    if (request.params.name === "update_settings") {
      const args = UpdateSettingsArgsSchema.parse(request.params.arguments);
      const fileName = args.setting_type === "site" ? "site.json" : `${args.setting_type}.${args.locale}.json`;
      const filePath = path.join(CMS_CONTENT_DIR, "settings", fileName);
      
      // Детерминированное сохранение. 
      // При желании здесь можно прогнать args.payload через строгую Zod схему из content.config.ts
      await writeFile(filePath, JSON.stringify(args.payload, null, 2), "utf-8");
      
      return {
        content: [{ type: "text", text: `Настройки ${args.setting_type}${args.setting_type === 'site' ? '' : '.' + args.locale} успешно обновлены.` }],
      };
    }

    throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${request.params.name}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(ErrorCode.InvalidParams, `Validation error: ${error.message}`);
    }
    throw new McpError(ErrorCode.InternalError, `Server error: ${String(error)}`);
  }
});

// 5. Запуск сервера
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Agentic CMS MCP Server running on stdio"); // stdio используется для данных, логи пишем в stderr
}

run().catch(console.error);
