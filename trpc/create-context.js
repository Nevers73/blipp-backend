import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import { sessionsStorage } from "../../storage/sessions-storage.js";
import { usersStorage } from "../../storage/users-storage.js";

export const createContext = async ({ req }) => {
  const sessionId = req.headers.get("x-session-id") || "";
  const userId = sessionId ? sessionsStorage.getUserId(sessionId) : undefined;
  const user = userId ? usersStorage.getById(userId) : undefined;

  return { req, sessionId, userId, user };
};

const t = initTRPC.context().create({
  transformer: superjson,
});

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
);

export const adminProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.userId || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next();
  })
);

export const createTRPCRouter = t.router;
