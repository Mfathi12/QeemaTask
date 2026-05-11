import "dotenv/config";
import { createServer } from "node:http";
import { assertRequiredEnv } from "./config/requiredEnv";
import { runStartupSeed } from "./bootstrap/seed";
import { createApp } from "./app";
import { wireRequestRealtime } from "./services/request.service";
import { attachSocketIO } from "./sockets/socket";

assertRequiredEnv();

const port = Number(process.env.PORT) || 3000;
const app = createApp();
const httpServer = createServer(app);

const { realtime } = attachSocketIO(httpServer);
wireRequestRealtime(realtime);

void (async () => {
  try {
    await runStartupSeed();
  } catch {
    process.exit(1);
  }
  httpServer.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
})();

export { httpServer };
