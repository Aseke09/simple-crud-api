import type { IncomingMessage, ServerResponse } from "node:http";

export function sendJson(res: ServerResponse, status: number, payload: unknown) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Length", Buffer.byteLength(body));
  res.end(body);
}

export function sendText(res: ServerResponse, status: number, message: string) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(message);
}

export function sendNoContent(res: ServerResponse) {
  res.statusCode = 204;
  res.end();
}

export function notFound(res: ServerResponse, msg = "Resource not found") {
  sendJson(res, 404, { message: msg });
}

export function badRequest(res: ServerResponse, msg: string) {
  sendJson(res, 400, { message: msg });
}

export function internalError(res: ServerResponse, err: unknown) {
  sendJson(res, 500, { message: "Internal Server Error" });
  // eslint-disable-next-line no-console
  console.error(err);
}

// Чтение JSON-тела 
export async function readJsonBody<T = unknown>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf-8").trim();
  return raw ? JSON.parse(raw) as T : ({} as T);
}
