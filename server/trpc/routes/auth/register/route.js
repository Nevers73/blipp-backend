import { publicProcedure } from "trpc/create-context.js";
import { usersStorage } from "storage/users-storage.js";
import { sessionsStorage } from "storage/sessions-storage.js";
import { z } from "zod";

export const register = publicProcedure
  .input(
    z.object({
      nom: z.string().min(1),
      email: z.string().email(),
      telephone: z.string().optional(),
    })
  )
  .mutation(({ input }) => {
    console.log(`[auth] Inscription utilisateur : ${input.email}`);

    // Vérifie si un utilisateur existe déjà
    const existingUser = usersStorage.getByEmail(input.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Crée un nouvel utilisateur
    const newUser = usersStorage.create({
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      nom: input.nom,
      email: input.email,
      telephone: input.telephone || "",
      role: "user",
      favoris: [],
    });

    // Crée la session immédiatement après l'inscription
    const sessionId = sessionsStorage.create(newUser.id);

    return {
      user: newUser,
      sessionId,
    };
  });
