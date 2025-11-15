import { serve } from "@hono/node-server";
import app from "./hono.js";

const port = process.env.PORT || 3000;

console.log(`🚀 Server starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port: Number(port),
  hostname: "0.0.0.0", // OBLIGATOIRE pour Render 🎯
});

console.log(`✅ Server running on port ${port}`);
