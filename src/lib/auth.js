import { storage } from "./storage";

// NOTE: this is client-side, localStorage-only auth. It gates the UI for
// a single-device/single-browser shop dashboard (separating admin vs
// staff views) — it is NOT real security. Passwords are hashed with
// SubtleCrypto (SHA-256) so they aren't sitting in plaintext in
// localStorage, but there is no server, so anyone with devtools access
// to this browser profile can still bypass it. Don't reuse these
// passwords anywhere sensitive.

async function hash(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function ensureDefaultAdmin() {
  const users = storage.getList(storage.KEYS.users);
  if (users.length > 0) return;
  const passwordHash = await hash("admin123");
  storage.insert(storage.KEYS.users, {
    id: storage.uid("usr"),
    username: "admin",
    name: "Shop Admin",
    role: "admin",
    passwordHash,
    createdAt: new Date().toISOString(),
  });
}

export async function login(username, password) {
  const users = storage.getList(storage.KEYS.users);
  const user = users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase()
  );
  if (!user) return { ok: false, error: "No account with that username." };
  const passwordHash = await hash(password);
  if (passwordHash !== user.passwordHash) {
    return { ok: false, error: "Incorrect password." };
  }
  const session = { userId: user.id, loggedInAt: new Date().toISOString() };
  storage.setValue(storage.KEYS.session, session);
  return { ok: true, user: publicUser(user) };
}

export function logout() {
  storage.setValue(storage.KEYS.session, null);
}

export function getSessionUser() {
  const session = storage.getValue(storage.KEYS.session, null);
  if (!session) return null;
  const users = storage.getList(storage.KEYS.users);
  const user = users.find((u) => u.id === session.userId);
  return user ? publicUser(user) : null;
}

export async function createStaff({ username, name, password, role }) {
  const users = storage.getList(storage.KEYS.users);
  if (
    users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())
  ) {
    return { ok: false, error: "That username is already taken." };
  }
  const passwordHash = await hash(password);
  const user = {
    id: storage.uid("usr"),
    username: username.trim(),
    name: name.trim(),
    role: role === "admin" ? "admin" : "staff",
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  storage.insert(storage.KEYS.users, user);
  return { ok: true, user: publicUser(user) };
}

export function removeStaff(id) {
  return storage.remove(storage.KEYS.users, id);
}

export function listUsers() {
  return storage.getList(storage.KEYS.users).map(publicUser);
}

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}
