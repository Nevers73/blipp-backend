// trpc/routes/auth/update-profile/route.js
import { protectedProcedure } from "trpc/create-context.js";

import { usersStorage } from "storage/users-storage.js";
import { z } from "zod";

export const updateProfile = protectedProcedure
  .input(
    z.object({
      nom: z.string().min(1).optional(),
      telephone: z.string().optional(),
    })
  )
  .mutation(({ ctx, input }) => {
    console.log(`[auth] Updating profile for user: ${ctx.userId}`);

    const updatedUser = usersStorage.update(ctx.userId, input);

    return { user: updatedUser };
  });
