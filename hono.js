import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";

import { appRouter } from "./trpc/app-router.js";
import { createContext } from "./trpc/create-context.js";

const app = new Hono();

app.use("*", cors());

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

app.get("/", (c) => c.json({ status: "ok" }));

export default app;
