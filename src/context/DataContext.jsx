import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "../lib/storage";
import { seedIfEmpty } from "../lib/seed";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [games, setGames] = useState([]);

  const reload = useCallback(() => {
    const list = storage.getList(storage.KEYS.transactions);
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    setTransactions(list);
    setGames(storage.getList(storage.KEYS.games));
  }, []);

  useEffect(() => {
    seedIfEmpty();
    reload();
  }, [reload]);

  const addTransaction = useCallback(
    (txn) => {
      const record = {
        id: storage.uid("txn"),
        date: new Date().toISOString(),
        status: "completed",
        type: "topup",
        profit: 0,
        costPrice: 0,
        ...txn,
      };
      storage.insert(storage.KEYS.transactions, record);
      if (record.game && !games.includes(record.game)) {
        const nextGames = [...games, record.game];
        storage.setList(storage.KEYS.games, nextGames);
      }
      reload();
      return record;
    },
    [games, reload]
  );

  const updateTransaction = useCallback(
    (id, patch) => {
      storage.update(storage.KEYS.transactions, id, patch);
      reload();
    },
    [reload]
  );

  const removeTransaction = useCallback(
    (id) => {
      storage.remove(storage.KEYS.transactions, id);
      reload();
    },
    [reload]
  );

  const stats = useMemo(() => computeStats(transactions), [transactions]);

  const value = {
    transactions,
    games,
    stats,
    addTransaction,
    updateTransaction,
    removeTransaction,
    reload,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

function computeStats(transactions) {
  const completed = transactions.filter((t) => t.status === "completed");
  const cashIn = completed
    .filter((t) => t.type === "topup")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const cashOut = completed
    .filter((t) => t.type === "refund" || t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const profit = completed
    .filter((t) => t.type === "topup")
    .reduce((sum, t) => sum + Number(t.profit || 0), 0);
  const pendingCount = transactions.filter((t) => t.status === "pending").length;
  const failedCount = transactions.filter((t) => t.status === "failed").length;
  const netCash = cashIn - cashOut;

  return {
    cashIn,
    cashOut,
    netCash,
    profit,
    pendingCount,
    failedCount,
    totalTransactions: transactions.length,
    completedCount: completed.length,
  };
}
