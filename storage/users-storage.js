class UsersStorage {
  constructor() {
    this.users = new Map();
    this.emailToId = new Map();

    // Admin par défaut
    const adminUser = {
      id: "admin-1",
      nom: "Admin",
      email: "admin@blipp.com",
      telephone: "",
      role: "admin",
      favoris: [],
    };

    this.users.set(adminUser.id, adminUser);
    this.emailToId.set(adminUser.email.toLowerCase(), adminUser.id);
  }

  normalizeEmail(email) {
    return (email || "").trim().toLowerCase();
  }

  getById(id) {
    const user = this.users.get(id);
    return user ? { ...user } : undefined;
  }

  getByEmail(email) {
    const normalized = this.normalizeEmail(email);
    const id = this.emailToId.get(normalized);
    const user = id ? this.users.get(id) : undefined;
    return user ? { ...user } : undefined;
  }

  create(user) {
    const normalizedEmail = this.normalizeEmail(user.email);

    if (this.emailToId.has(normalizedEmail)) {
      throw new Error("Email already exists");
    }

    const storedUser = {
      ...user,
      email: normalizedEmail,
      favoris: user.favoris || [],
    };

    this.users.set(storedUser.id, storedUser);
    this.emailToId.set(normalizedEmail, storedUser.id);

    console.log(`[UsersStorage] User created: ${storedUser.email}`);
    return { ...storedUser };
  }

  update(id, updates) {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }

    let normalizedEmail = user.email;

    if (updates.email) {
      const newEmail = this.normalizeEmail(updates.email);
      if (newEmail !== user.email) {
        if (this.emailToId.has(newEmail)) {
          throw new Error("Email already exists");
        }
        // Mettre à jour la map email → id
        this.emailToId.delete(user.email);
        this.emailToId.set(newEmail, id);
        normalizedEmail = newEmail;
      }
    }

    const updatedUser = {
      ...user,
      ...updates,
      email: normalizedEmail,
      id,
    };

    this.users.set(id, updatedUser);

    console.log(`[UsersStorage] User updated: ${id}`);

    return { ...updatedUser };
  }

  delete(id) {
    const user = this.users.get(id);
    if (user) {
      this.emailToId.delete(user.email);
      this.users.delete(id);
      console.log(`[UsersStorage] User deleted: ${id}`);
    }
  }

  addFavori(userId, couleurId) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.favoris.includes(couleurId)) {
      user.favoris = [...user.favoris, couleurId];
      console.log(`[UsersStorage] Added favori ${couleurId} for user ${userId}`);
      this.users.set(userId, user);
    }

    return { ...user };
  }

  removeFavori(userId, couleurId) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.favoris = user.favoris.filter((id) => id !== couleurId);
    this.users.set(userId, user);

    console.log(`[UsersStorage] Removed favori ${couleurId} for user ${userId}`);

    return { ...user };
  }
}

export const usersStorage = new UsersStorage();
