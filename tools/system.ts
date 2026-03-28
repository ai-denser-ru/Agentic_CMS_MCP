import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

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
