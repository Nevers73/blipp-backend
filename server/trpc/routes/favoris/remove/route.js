// trpc/routes/favoris/remove/route.js

import { protectedProcedure } from "trpc/create-context.js";

import { usersStorage } from "storage/users-storage.js";
import { z } from "zod";

export const removeFavori = protectedProcedure
  .input(z.object({ couleurId: z.string() }))
  .mutation(({ ctx, input }) => {
    console.log(`[tRPC] Removing favori ${input.couleurId} for user ${ctx.userId}`);

    const user = usersStorage.removeFavori(ctx.userId, input.couleurId);

    return { user };
  });
