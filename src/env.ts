import { readFile } from "node:fs/promises";

const DEFAULT_PORT = 4000;

export async function loadEnvFile(file = ".env"): Promise<void> {
    try {
        const raw = await readFile(file, "utf8");
        for (const line of raw.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;

            const eq = trimmed.indexOf("=");
            if (eq === -1) {
                console.warn(`[env] skip invalid line: ${trimmed}`);
                continue;
            }

            const key = trimmed.slice(0, eq).trim();
            let value = trimmed.slice(eq + 1).trim();

            if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            }

            if (key && process.env[key] == null) {
                process.env[key] = value;
            }
        }
    } catch (err: any) {
        if (err && err.code !== "ENOENT") {
            console.warn(`[env] cannot read ${file}:`, err.message ?? err);
        }
    }
}

export function getPortFromEnv(): number {
  const raw = process.env.PORT;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_PORT;
}
