// Single localStorage abstraction layer.
// Every read/write in the app goes through here so the persistence
// strategy can be swapped later (e.g. for a real backend) in one place.

const PREFIX = "topup_ledger:";

const KEYS = {
  transactions: `${PREFIX}transactions`,
  users: `${PREFIX}users`,
  session: `${PREFIX}session`,
  games: `${PREFIX}games`,
  settings: `${PREFIX}settings`,
  seeded: `${PREFIX}seeded`,
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`storage: failed to read ${key}`, err);
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`storage: failed to write ${key}`, err);
    return false;
  }
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const storage = {
  KEYS,
  uid,

  // ---- generic list helpers ----
  getList(key) {
    return read(key, []);
  },
  setList(key, list) {
    return write(key, list);
  },
  insert(key, item) {
    const list = read(key, []);
    list.push(item);
    write(key, list);
    return item;
  },
  update(key, id, patch) {
    const list = read(key, []);
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    write(key, list);
    return list[idx];
  },
  remove(key, id) {
    const list = read(key, []);
    const next = list.filter((i) => i.id !== id);
    write(key, next);
    return next.length !== list.length;
  },

  // ---- scalar helpers ----
  getValue(key, fallback) {
    return read(key, fallback);
  },
  setValue(key, value) {
    return write(key, value);
  },
};
