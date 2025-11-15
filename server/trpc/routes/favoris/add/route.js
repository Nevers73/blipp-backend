// trpc/routes/favoris/add/route.js

import { protectedProcedure } from "trpc/create-context.js";
import { usersStorage } from "storage/users-storage.js";
import { z } from "zod";

export const addFavori = protectedProcedure
  .input(z.object({ couleurId: z.string() }))
  .mutation(({ ctx, input }) => {
    console.log(`[tRPC] Adding favori ${input.couleurId} for user ${ctx.userId}`);

    const user = usersStorage.addFavori(ctx.userId, input.couleurId);

    return { user };
  });
