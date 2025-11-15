import { publicProcedure } from "../../../../../trpc/app-router.js";
import { z } from "zod";

export default publicProcedure
  .input(z.object({ categorie: z.string() }))
  .query(async ({ input }) => {
    return {
      message: `Categorie recherchée : ${input.categorie}`,
      data: []
    };
  });
