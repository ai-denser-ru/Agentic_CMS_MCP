import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { readFile } from "fs/promises";

const execPromise = promisify(exec);

/**
 * Запускает сборку сайта для проверки корректности изменений.
 */
export async function verifyBuild(siteDir: string) {
  try {
    // Выходим на уровень выше от content_dir и заходим в корень сайта
    const projectRoot = path.join(siteDir, "..");
    
    const { stdout, stderr } = await execPromise("npm run build", { cwd: projectRoot });
    
    return {
      content: [
        {
          type: "text",
          text: `Build successful!\n\nSTDOUT:\n${stdout.slice(-1000)}\n\nSTDERR:\n${stderr}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Build failed!\n\nError: ${error.message}\n\nSTDOUT:\n${error.stdout?.slice(-1000)}\n\nSTDERR:\n${error.stderr}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Возвращает статус Git для отслеживания измененных файлов.
 */
export async function getGitStatus(siteDir: string) {
  try {
    const projectRoot = path.join(siteDir, "..");
    const { stdout } = await execPromise("git status --short", { cwd: projectRoot });
    
    return {
      content: [
        {
          type: "text",
          text: stdout || "No changes detected.",
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Git error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Выполняет откат всех незакоммиченных изменений.
 */
export async function rollbackChanges(siteDir: string) {
  try {
    const projectRoot = path.join(siteDir, "..");
    await execPromise("git checkout .", { cwd: projectRoot });
    
    return {
      content: [
        {
          type: "text",
          text: "All uncommitted changes have been rolled back.",
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Rollback error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Фиксирует изменения в Git (git add . && git commit -m "...").
 */
export async function gitCommit(siteDir: string, args: any) {
  try {
    const projectRoot = path.join(siteDir, "..");
    const { message } = args;
    if (!message) throw new Error("Commit message is required");

    await execPromise("git add .", { cwd: projectRoot });
    const { stdout } = await execPromise(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: projectRoot });

    return {
      content: [
        {
          type: "text",
          text: `Changes committed successfully!\n\n${stdout}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Git commit error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Отправляет изменения на GitHub (git push origin main).
 */
export async function gitPush(siteDir: string) {
  try {
    const projectRoot = path.join(siteDir, "..");
    // Пробуем пушнуть в main. Можно расширить для поддержки других веток.
    const { stdout, stderr } = await execPromise("git push origin main", { cwd: projectRoot });

    return {
      content: [
        {
          type: "text",
          text: `Changes pushed to GitHub successfully!\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Git push error: ${error.message}\n\nSTDOUT:\n${error.stdout}\n\nSTDERR:\n${error.stderr}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Запускает временный веб-превью через localtunnel.
 */
export async function getPreviewUrl(siteDir: string) {
  try {
    const projectRoot = path.join(siteDir, "..");
    
    // 1. Собираем сайт
    console.error("[MCP] Building site for preview...");
    await execPromise("npm run build", { cwd: projectRoot });

    // 2. Запускаем сервер превью и туннель
    // Мы используем npx localtunnel. Он выдает URL в stdout.
    console.error("[MCP] Starting preview server and tunnel...");
    
    // Запускаем через shell, чтобы иметь возможность убить дерево процессов
    const previewProcess = exec("npm run preview", { cwd: projectRoot });
    
    // Ждем немного, чтобы порт 4321 открылся
    await new Promise(resolve => setTimeout(resolve, 3000));

    return new Promise(async (resolve) => {
      const ltProcess = exec("npx localtunnel --port 4321", { cwd: projectRoot });
      let urlFound = false;

      ltProcess.stdout?.on("data", async (data) => {
        const output = data.toString();
        const match = output.match(/your url is: (https:\/\/.*)/);
        if (match && !urlFound) {
          urlFound = true;
          const url = match[1].trim();
          
          // Планируем завершение через 15 минут
          setTimeout(() => {
            console.error("[MCP] Cleaning up preview processes...");
            ltProcess.kill();
            previewProcess.kill();
          }, 15 * 60 * 1000);

          // We try to append the base path from site.json
          let finalUrl = url;
          try {
            const siteJsonPath = path.join(siteDir, "settings/site.json");
            const siteData = JSON.parse(await readFile(siteJsonPath, "utf-8"));
            if (siteData.base && siteData.base !== "/") {
              const base = siteData.base.startsWith("/") ? siteData.base : "/" + siteData.base;
              finalUrl = `${url.replace(/\/$/, "")}${base}`;
            }
          } catch (e) {
            console.error("[MCP] Could not read base path for preview URL:", e);
          }

          resolve({
            content: [
              {
                type: "text",
                text: `Preview is ready!\n\nURL: ${finalUrl}\n\nThis link will be active for 15 minutes.`,
              },
            ],
          });
        }
      });

      ltProcess.stderr?.on("data", (data) => {
        console.error(`[LT Error]: ${data}`);
      });

      // Тайм-аут на поиск URL
      setTimeout(() => {
        if (!urlFound) {
          ltProcess.kill();
          previewProcess.kill();
          resolve({
            content: [{ type: "text", text: "Timed out waiting for localtunnel URL." }],
            isError: true,
          });
        }
      }, 30000);
    });
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Preview error: ${error.message}` }],
      isError: true,
    };
  }
}
