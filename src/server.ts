import { createServer } from "node:http";
import { getPortFromEnv, loadEnvFile } from "./env.js";
import { handleRequest } from "./router.js";
import { internalError } from "./http.js";

async function bootstrap() {
    await loadEnvFile();

    const server = createServer(async (req, res) => {
        try {
            await handleRequest(req, res);
        } catch (err) {
            internalError(res, err);
        }
        });

     process.on('SIGTERM', () => server.close(() => process.exit(0)));
     process.on('SIGINT',  () => server.close(() => process.exit(0)));    

    const port = getPortFromEnv();
        server.listen(port, () => {
        console.log(`HTTP server listening on http://localhost:${port}`);
    });
}

bootstrap().catch((e) => {
    console.error("Fatal startup error:", e);
    process.exit(1);
});



