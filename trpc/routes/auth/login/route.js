import { publicProcedure } from "../../create-context.js";
import { usersStorage } from "../../../storage/users-storage.js";
import { sessionsStorage } from "../../../storage/sessions-storage.js";
import { z } from "zod";

export const login = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
    })
  )
  .mutation(({ input }) => {
    console.log(`[tRPC] Login attempt: ${input.email}`);

    const user = usersStorage.getByEmail(input.email);
    if (!user) {
      throw new Error("User not found");
    }

    const sessionId = sessionsStorage.create(user.id);

    return {
      user,
      sessionId,
    };
  });
