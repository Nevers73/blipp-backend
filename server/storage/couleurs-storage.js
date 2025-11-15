// server/storage/couleurs-storage.js
import { couleursMock } from "../data/couleurs.js";
import path from "path";
import { promises as fs } from "fs";

const GIST_RAW_URL =
  "https://gist.githubusercontent.com/Nevers73/1a903e9aeb13c4f40b337d40869cce10/raw/";

const GLOBAL_STORAGE_KEY = "__couleursCache__";

// ✅ On part de la racine du projet, puis server/storage/data
const DATA_DIR = path.join(process.cwd(), "server", "storage", "data");
const DATA_FILE_PATH = path.join(DATA_DIR, "couleurs.json");

// ... (le reste de ton fichier tel que tu l’as déjà)


const globalScope = globalThis;

class CouleursStorage {
  constructor() {
    this.couleurs = [...couleursMock];
    this.initialized = false;
    this.canPersist = true;
  }

  isPermissionError(error) {
    if (!error) return false;
    const code = error.code;
    if (code === "EACCES" || code === "EPERM") return true;
    if (error.message) {
      const normalized = error.message.toLowerCase();
      return (
        normalized.includes("permission") ||
        normalized.includes("not allowed") ||
        normalized.includes("requires")
      );
    }
    return false;
  }

  loadFromGlobal() {
    const stored = globalScope[GLOBAL_STORAGE_KEY];
    return Array.isArray(stored) ? stored : null;
  }

  saveToGlobal(couleurs) {
    globalScope[GLOBAL_STORAGE_KEY] = [...couleurs];
  }

  async ensureDataDirectory() {
    if (!this.canPersist) return;
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
      if (this.isPermissionError(error)) {
        this.canPersist = false;
        this.saveToGlobal(this.couleurs);
        console.warn("[CouleursStorage] File persistence disabled (mkdir)");
        return;
      }
      console.error("[CouleursStorage] Failed to ensure data directory", error);
      throw error;
    }
  }

  async loadFromFile() {
    if (!this.canPersist) return this.loadFromGlobal();

    try {
      const content = await fs.readFile(DATA_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : null;
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("[CouleursStorage] No local file found");
        return null;
      }
      if (this.isPermissionError(error)) {
        this.canPersist = false;
        console.warn("[CouleursStorage] Persistence disabled (read)");
        return this.loadFromGlobal();
      }
      console.error("[CouleursStorage] Failed to read file", error);
      return null;
    }
  }

  async persist(couleurs) {
    if (!this.canPersist) {
      this.saveToGlobal(couleurs);
      return;
    }

    await this.ensureDataDirectory();

    try {
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(couleurs, null, 2), "utf-8");
      console.log(`[CouleursStorage] Saved ${couleurs.length} couleurs`);
    } catch (error) {
      if (this.isPermissionError(error)) {
        this.canPersist = false;
        this.saveToGlobal(couleurs);
        console.warn("[CouleursStorage] Persistence disabled (write)");
        return;
      }
      console.error("[CouleursStorage] Failed to write file", error);
      throw error;
    }
  }

  async fetchFromGist() {
    try {
      console.log("[CouleursStorage] Fetching from Gist…");
      const response = await fetch(GIST_RAW_URL);
      const text = await response.text();

      const lines = text.trim().split("\n").slice(1);

      return lines.map((line, index) => {
        const v = line.split("\t");
        return {
          id: String(index + 1),
          numero: index + 1,
          gouttesA: +v[0] || 0,
          gouttesB: +v[1] || 0,
          gouttesC: +v[2] || 0,
          gouttesD: +v[3] || 0,
          gouttesE: +v[4] || 0,
          gouttesF: +v[5] || 0,
          gouttesG: +v[6] || 0,
          gouttesH: +v[7] || 0,
          gouttesI: +v[8] || 0,
          volume: +v[9] || 0,
          L: +v[10] || 0,
          A: +v[11] || 0,
          B: +v[12] || 0,
          hex: v[13] || "#000000",
          nom: v[14] || "",
        };
      });
    } catch (e) {
      console.error("[CouleursStorage] Gist fetch failed", e);
      return null;
    }
  }

  async initialize() {
    if (this.initialized) return;

    const gist = await this.fetchFromGist();
    if (gist?.length) {
      this.couleurs = gist;
      this.saveToGlobal(gist);
      await this.persist(gist);
      this.initialized = true;
      return;
    }

    const cache = this.loadFromGlobal();
    if (cache?.length) {
      this.couleurs = cache;
      this.initialized = true;
      return;
    }

    await this.ensureDataDirectory();
    const file = await this.loadFromFile();
    if (file?.length) {
      this.couleurs = file;
    } else {
      await this.persist(this.couleurs);
    }

    this.initialized = true;
  }

  getAll() {
    return this.couleurs;
  }

  getById(id) {
    return this.couleurs.find((x) => x.id === id);
  }

  getByCategorie(cat) {
    return this.couleurs.filter((x) => x.categorie === cat);
  }

  search(query) {
    const q = query.toLowerCase();
    return this.couleurs.filter(
      (c) =>
        c.nom.toLowerCase().includes(q) ||
        c.hex.toLowerCase().includes(q) ||
        c.categorie.toLowerCase().includes(q)
    );
  }

  findClosestByHex(targetHex) {
    if (!this.couleurs.length) return null;

    const hexToRgb = (h) => {
      h = h.replace("#", "");
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
      };
    };

    const dist = (h1, h2) => {
      const a = hexToRgb(h1);
      const b = hexToRgb(h2);
      return Math.sqrt(
        (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2
      );
    };

    return this.couleurs.reduce((min, c) =>
      dist(c.hex, targetHex) < dist(min.hex, targetHex) ? c : min
    );
  }

  async replaceAll(newCouleurs) {
    this.couleurs = newCouleurs;
    this.saveToGlobal(newCouleurs);
    await this.persist(newCouleurs);
  }

  getCategories() {
    return [...new Set(this.couleurs.map((c) => c.categorie))].sort();
  }
}

export const couleursStorage = new CouleursStorage();
