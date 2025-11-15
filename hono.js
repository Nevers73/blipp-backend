// hono.js
import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router.js";
import { createContext } from "./trpc/create-context.js";

const app = new Hono();

// CORS global
app.use("*", cors());

// tRPC endpoint
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

// Route racine
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

export default app;
