import { createContext } from "../../../create-context.js";
import { couleursStorage } from "../../../storage/couleurs-storage.js";

export const listCouleurs = publicProcedure.query(async () => {
  await couleursStorage.initialize();
  console.log("[couleurs] Fetching all couleurs");

  const couleurs = couleursStorage.getAll();
  return { couleurs };
});
