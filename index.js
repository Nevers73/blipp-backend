import { serve } from "@hono/node-server";
import app from "./hono.js";

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Starting server on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Hono server is running`);
