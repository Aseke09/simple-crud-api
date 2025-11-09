import { createServer } from "node:http";
import { handleRequest } from "./router.js";
import { internalError } from "./http.js";

export function createHttpServer() {
  return createServer(async (req, res) => {
    try {
      await handleRequest(req, res);
    } catch (err) {
      internalError(res, err);
    }
  });
}
