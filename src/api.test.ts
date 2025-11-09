import test from "node:test";
import assert from "node:assert";
import http from "node:http";
import { createHttpServer } from "../src/app.js";

function reqJSON(method: string, path: string, payload?: unknown, port?: number): Promise<{status:number, body:any, headers:http.IncomingHttpHeaders}> {
  return new Promise((resolve, reject) => {
    const data = payload ? Buffer.from(JSON.stringify(payload)) : undefined;
    const req = http.request(
      { hostname: "127.0.0.1", port, path, method, headers: data ? { "Content-Type": "application/json", "Content-Length": data.length } : {} },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          let body: any = undefined;
          try { body = raw ? JSON.parse(raw) : undefined; } catch { body = raw; }
          resolve({ status: res.statusCode ?? 0, body, headers: res.headers });
        });
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

test("CRUD happy path", async (t) => {
  const server = createHttpServer();
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as any).port as number;

  await t.test("GET /api/users -> []", async () => {
    const res = await reqJSON("GET", "/api/users", undefined, port);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 0);
  });

  let userId = "";
  await t.test("POST /api/users -> 201 + object with id", async () => {
    const payload = { username: "John", age: 30, hobbies: ["reading"] };
    const res = await reqJSON("POST", "/api/users", payload, port);
    assert.equal(res.status, 201);
    assert.equal(res.body.username, "John");
    assert.equal(res.body.age, 30);
    assert.deepEqual(res.body.hobbies, ["reading"]);
    assert.ok(typeof res.body.id === "string");
    userId = res.body.id;
  });

  await t.test("GET /api/users/{id} -> 200", async () => {
    const res = await reqJSON("GET", `/api/users/${userId}`, undefined, port);
    assert.equal(res.status, 200);
    assert.equal(res.body.id, userId);
  });

  await t.test("PUT /api/users/{id} -> 200 updated", async () => {
    const res = await reqJSON("PUT", `/api/users/${userId}`, { username: "Jane", age: 28, hobbies: [] }, port);
    assert.equal(res.status, 200);
    assert.equal(res.body.username, "Jane");
    assert.equal(res.body.age, 28);
  });

  await t.test("DELETE /api/users/{id} -> 204", async () => {
    const res = await reqJSON("DELETE", `/api/users/${userId}`, undefined, port);
    assert.equal(res.status, 204);
  });

  await t.test("GET deleted -> 404", async () => {
    const res = await reqJSON("GET", `/api/users/${userId}`, undefined, port);
    assert.equal(res.status, 404);
    assert.equal(res.body?.message, "User not found");
  });

  server.close();
});

test("invalid inputs", async (t) => {
  const server = createHttpServer();
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as any).port as number;

  await t.test("GET by invalid uuid -> 400", async () => {
    const res = await reqJSON("GET", "/api/users/not-a-uuid", undefined, port);
    assert.equal(res.status, 400);
  });

  await t.test("POST invalid body -> 400", async () => {
    const res = await reqJSON("POST", "/api/users", { username: "", age: "x", hobbies: "nope" }, port);
    assert.equal(res.status, 400);
  });

  await t.test("unknown route -> 404 with message", async () => {
    const res = await reqJSON("GET", "/some-non/existing/resource", undefined, port);
    assert.equal(res.status, 404);
    assert.match(res.body?.message ?? "", /Cannot GET \/some-non\/existing\/resource/);
  });

  server.close();
});
