import type { User } from "./types.js";

class InMemoryDB {
  private users = new Map<string, User>();

  list(): User[] {
    return Array.from(this.users.values());
  }

  get(id: string): User | undefined { 
    return this.users.get(id); 
}

  create(u: User): User { 
    this.users.set(u.id, u); 
    return u; 
}

  update(id: string, patch: Omit<User,"id">): User | undefined {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated: User = { id, ...patch };
    this.users.set(id, updated);
    return updated;
  }
  
  delete(id: string): boolean {
    return this.users.delete(id);
  }
}

export const db = new InMemoryDB();
