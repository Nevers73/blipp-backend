import { publicProcedure } from "../../create-context.js";
import { usersStorage } from "../../../storage/users-storage.js";
import { sessionsStorage } from "../../../storage/sessions-storage.js";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const login = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
    })
  )
  .mutation(({ input }) => {
    console.log(`[auth] Tentative de login pour : ${input.email}`);

    const user = usersStorage.getByEmail(input.email);

    if (!user) {
      console.warn(`[auth] Email inconnu : ${input.email}`);
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Utilisateur introuvable",
      });
    }

    const sessionId = sessionsStorage.create(user.id);

    console.log(`[auth] Login réussi pour ${user.id}`);

    return {
      user,
      sessionId,
    };
  });
