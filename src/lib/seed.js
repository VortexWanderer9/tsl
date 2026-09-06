import { storage } from "./storage";

const GAMES = [
  { name: "Free Fire", packages: ["100 Diamonds", "310 Diamonds", "520 Diamonds", "1080 Diamonds"] },
  { name: "PUBG Mobile", packages: ["60 UC", "325 UC", "660 UC", "1800 UC"] },
  { name: "Mobile Legends", packages: ["86 Diamonds", "172 Diamonds", "706 Diamonds"] },
  { name: "Valorant", packages: ["475 VP", "1000 VP", "2050 VP"] },
  { name: "Genshin Impact", packages: ["60 Crystals", "300 Crystals", "980 Crystals"] },
];

const METHODS = ["esewa", "khalti", "bank_transfer", "cash", "card"];
const CUSTOMERS = [
  "Anish Sharma", "Priya Thapa", "Rohit K.C.", "Sunita Rai", "Bibek Gurung",
  "Nisha Shrestha", "Suman Poudel", "Arjun Magar", "Kritika Tamang", "Deepak Adhikari",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

export function seedIfEmpty() {
  const already = storage.getValue(storage.KEYS.seeded, false);
  if (already) return;

  const existing = storage.getList(storage.KEYS.transactions);
  if (existing.length > 0) {
    storage.setValue(storage.KEYS.seeded, true);
    return;
  }

  storage.setList(storage.KEYS.games, GAMES.map((g) => g.name));

  const now = Date.now();
  const txns = [];
  for (let i = 0; i < 90; i++) {
    const game = pick(GAMES);
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date(now - daysAgo * 86400000 - Math.random() * 43200000).toISOString();
    const amount = randomBetween(150, 4500);
    const costPrice = Math.round(amount * randomBetween(0.78, 0.92) * 100) / 100;
    const roll = Math.random();
    const status = roll < 0.86 ? "completed" : roll < 0.93 ? "pending" : roll < 0.97 ? "refunded" : "failed";
    const type = status === "refunded" ? "refund" : "topup";

    txns.push({
      id: storage.uid("txn"),
      date,
      customerName: pick(CUSTOMERS),
      customerContact: `98${Math.floor(10000000 + Math.random() * 89999999)}`,
      game: game.name,
      coinPackage: pick(game.packages),
      amount,
      costPrice,
      profit: status === "completed" ? Math.round((amount - costPrice) * 100) / 100 : 0,
      paymentMethod: pick(METHODS),
      type,
      status,
      notes: "",
    });
  }

  // a few manual expense entries (cash out not tied to a customer order)
  const expenseNotes = ["Supplier top-up balance reload", "Internet bill", "Shop rent share", "Misc equipment"];
  for (let i = 0; i < 6; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date(now - daysAgo * 86400000).toISOString();
    txns.push({
      id: storage.uid("txn"),
      date,
      customerName: "",
      customerContact: "",
      game: "",
      coinPackage: "",
      amount: randomBetween(500, 5000),
      costPrice: 0,
      profit: 0,
      paymentMethod: pick(METHODS),
      type: "expense",
      status: "completed",
      notes: pick(expenseNotes),
    });
  }

  txns.sort((a, b) => new Date(b.date) - new Date(a.date));
  storage.setList(storage.KEYS.transactions, txns);
  storage.setValue(storage.KEYS.seeded, true);
}
