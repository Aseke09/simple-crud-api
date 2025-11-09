import type { IncomingMessage, ServerResponse } from "node:http";
import { db } from "./db.js";
import { badRequest, notFound, readJsonBody, sendJson, sendNoContent } from "./http.js";
import { isUuidV4Like, validateCreate, validateUpdate } from "./validation.js";
import { randomUUID } from "node:crypto";
import type { CreateUserDto, UpdateUserDto } from "./types.js";

function normalizePath(url: string | undefined) {
  if (!url) return "/";
  try {
    return new URL(url, "http://localhost").pathname;
  } catch {
    return url.split("?")[0] ?? "/";
  }
}

function matchUsersId(path: string): { ok: true; id: string | undefined } | { ok: false } {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 3 && parts[0] === "api" && parts[1] === "users") {
    return { ok: true, id: parts[2] };
  }
  return { ok: false };
}

export async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const method = (req.method || "GET").toUpperCase();
  const path = normalizePath(req.url);

  // ---- /api/users (GET) ----
  if (method === "GET" && path === "/api/users") {
    const all = db.list();
    return sendJson(res, 200, all);
  }

   // POST /api/users
  if (method === "POST" && path === "/api/users") {
    const body = await readJsonBody<CreateUserDto>(req);
    const validated = validateCreate(body);
    if (!validated.ok) {
      return badRequest(res, validated.message);
    }
    const user = { id: randomUUID(), ...validated.value };
    db.create(user);
    return sendJson(res, 201, user);
  }

  // GET /api/users/:id
  if (method === "GET" && matchUsersId(path).ok) {
    const { id } = matchUsersId(path) as { ok: true; id: string };
    if (!isUuidV4Like(id)) return badRequest(res, "Invalid userId (must be UUID v4)");
    const found = db.get(id);
    if (!found) return notFound(res, "User not found");
    return sendJson(res, 200, found);
  }

  // PUT /api/users/:id
  if (method === "PUT" && matchUsersId(path).ok) {
    const { id } = matchUsersId(path) as { ok: true; id: string };
    if (!isUuidV4Like(id)) return badRequest(res, "Invalid userId (must be UUID v4)");

    const body = await readJsonBody<UpdateUserDto>(req);
    const validated = validateUpdate(body);
    if (!validated.ok) {
      return badRequest(res, validated.message);
    }

    const updated = db.update(id, validated.value);
    if (!updated) return notFound(res, "User not found");
    return sendJson(res, 200, updated);
  }

   // DELETE /api/users/:id
  if (method === "DELETE" && matchUsersId(path).ok) {
    const { id } = matchUsersId(path) as { ok: true; id: string };
    if (!isUuidV4Like(id)) return badRequest(res, "Invalid userId (must be UUID v4)");

    const ok = db.delete(id);
    if (!ok) return notFound(res, "User not found");
    return sendNoContent(res);
  }

  // Остальные пути пока не реализованы — вернём 404
  return notFound(res, `Cannot ${method} ${path}`);
}
