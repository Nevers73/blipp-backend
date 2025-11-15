import { couleursMock } from "../data/couleurs.js";
import path from "path";
import { promises as fs } from "fs";

const GIST_RAW_URL =
  "https://gist.githubusercontent.com/Nevers73/1a903e9aeb13c4f40b337d40869cce10/raw/";

const GLOBAL_STORAGE_KEY = "__couleursCache__";

// ⚠️ ICI : on enlève "backend"
const DATA_DIR = path.join(process.cwd(), "storage", "data");
const DATA_FILE_PATH = path.join(DATA_DIR, "couleurs.json");

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
    if (Array.isArray(stored)) return stored;
    return null;
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
        console.warn(
          "[CouleursStorage] File persistence disabled due to permission error"
        );
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
      if (Array.isArray(parsed)) return parsed;
      console.warn(
        "[CouleursStorage] Stored data is invalid, falling back to defaults"
      );
      return null;
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("[CouleursStorage] No existing storage file, using defaults");
        return null;
      }
      if (this.isPermissionError(error)) {
        this.canPersist = false;
        console.warn(
          "[CouleursStorage] File persistence disabled due to permission error during read"
        );
        return this.loadFromGlobal();
      }
      console.error("[CouleursStorage] Failed to read storage file", error);
      return null;
    }
  }

  async persist(couleurs) {
    if (!this.canPersist) {
      this.saveToGlobal(couleurs);
      return;
    }
    await this.ensureDataDirectory();
    if (!this.canPersist) {
      this.saveToGlobal(couleurs);
      return;
    }
    try {
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(couleurs, null, 2), "utf-8");
      console.log(`[CouleursStorage] Persisted ${couleurs.length} couleurs to file`);
    } catch (error) {
      if (this.isPermissionError(error)) {
        this.canPersist = false;
        this.saveToGlobal(couleurs);
        console.warn(
          "[CouleursStorage] File persistence disabled due to permission error during write"
        );
        return;
      }
      console.error("[CouleursStorage] Failed to persist couleurs", error);
      throw error;
    }
  }

  async fetchFromGist() {
    try {
      console.log("[CouleursStorage] Fetching couleurs from Gist...");
      const response = await fetch(GIST_RAW_URL);
      const text = await response.text();
      const lines = text.trim().split("\n");
      const couleurs = lines.slice(1).map((line, index) => {
        const values = line.split("\t");
        return {
          id: String(index + 1),
          numero: index + 1,
          gouttesA: parseFloat(values[0]) || 0,
          gouttesB: parseFloat(values[1]) || 0,
          gouttesC: parseFloat(values[2]) || 0,
          gouttesD: parseFloat(values[3]) || 0,
          gouttesE: parseFloat(values[4]) || 0,
          gouttesF: parseFloat(values[5]) || 0,
          gouttesG: parseFloat(values[6]) || 0,
          gouttesH: parseFloat(values[7]) || 0,
          gouttesI: parseFloat(values[8]) || 0,
          volume: parseFloat(values[9]) || 0,
          L: parseFloat(values[10]) || 0,
          A: parseFloat(values[11]) || 0,
          B: parseFloat(values[12]) || 0,
          hex: values[13] || "#000000",
          nom: values[14] || "",
        };
      });
      console.log(`[CouleursStorage] Fetched ${couleurs.length} couleurs from Gist`);
      return couleurs;
    } catch (error) {
      console.error("[CouleursStorage] Failed to fetch from Gist:", error);
      return null;
    }
  }

  async initialize() {
    if (this.initialized) return;

    const gistCouleurs = await this.fetchFromGist();
    if (gistCouleurs && gistCouleurs.length > 0) {
      this.couleurs = gistCouleurs;
      this.saveToGlobal(gistCouleurs);
      await this.persist(gistCouleurs);
      this.initialized = true;
      console.log(
        `[CouleursStorage] Initialized with ${gistCouleurs.length} couleurs from Gist`
      );
      return;
    }

    const globalStored = this.loadFromGlobal();
    if (globalStored && globalStored.length > 0) {
      this.couleurs = globalStored;
      this.initialized = true;
      console.log(
        `[CouleursStorage] Loaded ${globalStored.length} couleurs from global cache`
      );
      return;
    }

    await this.ensureDataDirectory();
    const stored = await this.loadFromFile();
    if (stored && stored.length > 0) {
      this.couleurs = stored;
      console.log(`[CouleursStorage] Loaded ${stored.length} couleurs from file`);
    } else {
      await this.persist(this.couleurs);
      console.log("[CouleursStorage] Initialized storage with default couleurs");
    }
    this.initialized = true;
  }

  getAll() {
    return this.couleurs;
  }

  getById(id) {
    return this.couleurs.find((c) => c.id === id);
  }

  getByCategorie(categorie) {
    return this.couleurs.filter((c) => c.categorie === categorie);
  }

  search(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.couleurs.filter(
      (c) =>
        c.nom.toLowerCase().includes(lowercaseQuery) ||
        c.hex.toLowerCase().includes(lowercaseQuery) ||
        c.categorie.toLowerCase().includes(lowercaseQuery)
    );
  }

  findClosestByHex(targetHex) {
    if (this.couleurs.length === 0) return null;

    const hexToRgb = (hex) => {
      const cleaned = hex.replace("#", "");
      return {
        r: parseInt(cleaned.substring(0, 2), 16),
        g: parseInt(cleaned.substring(2, 4), 16),
        b: parseInt(cleaned.substring(4, 6), 16),
      };
    };

    const colorDistance = (hex1, hex2) => {
      const rgb1 = hexToRgb(hex1);
      const rgb2 = hexToRgb(hex2);
      return Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
          Math.pow(rgb1.g - rgb2.g, 2) +
          Math.pow(rgb1.b - rgb2.b, 2)
      );
    };

    let closest = this.couleurs[0];
    let minDistance = colorDistance(targetHex, closest.hex);
    for (let i = 1; i < this.couleurs.length; i++) {
      const distance = colorDistance(targetHex, this.couleurs[i].hex);
      if (distance < minDistance) {
        minDistance = distance;
        closest = this.couleurs[i];
      }
    }
    return closest;
  }

  async replaceAll(newCouleurs) {
    this.couleurs = newCouleurs;
    this.saveToGlobal(newCouleurs);
    console.log(`Couleurs storage updated with ${newCouleurs.length} items`);
    await this.persist(newCouleurs);
  }

  getCategories() {
    const categories = new Set(this.couleurs.map((c) => c.categorie));
    return Array.from(categories).sort();
  }
}

export const couleursStorage = new CouleursStorage();
