import { createTRPCRouter } from "./create-context.js";

// Couleurs
import { listCouleurs } from "./routes/couleurs/list/route.js";
import { getCouleurById } from "./routes/couleurs/get-by-id/route.js";
import { getCouleursByCategorie } from "./routes/couleurs/get-by-categorie/route.js";
import { searchCouleurs } from "./routes/couleurs/search/route.js";
import { findClosestCouleur } from "./routes/couleurs/find-closest/route.js";
import { getCategories } from "./routes/couleurs/get-categories/route.js";

// Auth
import { register } from "./routes/auth/register/route.js";
import { login } from "./routes/auth/login/route.js";
import { logout } from "./routes/auth/logout/route.js";
import { me } from "./routes/auth/me/route.js";
import { updateProfile } from "./routes/auth/update-profile/route.js";

// Favoris
import { addFavori } from "./routes/favoris/add/route.js";
import { removeFavori } from "./routes/favoris/remove/route.js";
import { listFavoris } from "./routes/favoris/list/route.js";

// Admin
import { uploadCSV } from "./routes/admin/upload-csv/route.js";

const hiRoute = () => "hi";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),

  couleurs: createTRPCRouter({
    list: listCouleurs,
    getById: getCouleurById,
    getByCategorie: getCouleursByCategorie,
    search: searchCouleurs,
    findClosest: findClosestCouleur,
    getCategories,
  }),

  auth: createTRPCRouter({
    register,
    login,
    logout,
    me,
    updateProfile,
  }),

  favoris: createTRPCRouter({
    add: addFavori,
    remove: removeFavori,
    list: listFavoris,
  }),

  admin: createTRPCRouter({
    uploadCSV,
  }),
});
