import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Download, X } from "lucide-react";
import Topbar from "../components/Topbar";
import Modal from "../components/Modal";
import TransactionForm from "../components/TransactionForm";
import { StatusBadge, TypeBadge } from "../components/Badge";
import { useData } from "../context/DataContext";
import { formatMoney, formatDateTime } from "../lib/format";

const inputClass =
  "bg-panel2 border border-border px-2.5 py-1.5 text-sm text-text focus:border-accent transition-colors";

export default function Transactions() {
  const { transactions, removeTransaction } = useData();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const filtered = useMemo(() => {
    let list = transactions;
    if (typeFilter !== "all") list = list.filter((t) => t.type === typeFilter);
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((t) =>
        [t.customerName, t.game, t.coinPackage, t.notes, t.customerContact]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(q))
      );
    }
    list = [...list].sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === "date") {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      }
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [transactions, typeFilter, statusFilter, query, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function openEdit(txn) {
    setEditing(txn);
    setFormOpen(true);
  }

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function exportCsv() {
    const headers = [
      "date", "type", "status", "customerName", "customerContact",
      "game", "coinPackage", "amount", "costPrice", "profit", "paymentMethod", "notes",
    ];
    const rows = filtered.map((t) => headers.map((h) => csvSafe(t[h])).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeFilterCount = [typeFilter !== "all", statusFilter !== "all", query.trim() !== ""].filter(Boolean).length;

  return (
    <>
      <Topbar
        title="Transactions"
        subtitle={`${filtered.length} of ${transactions.length} records`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 border border-border text-muted text-sm px-3 py-1.5 hover:text-text hover:border-borderLight transition-colors"
            >
              <Download size={14} />
              Export CSV
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-accent text-bg text-sm font-medium px-3 py-1.5 hover:bg-accent/90 transition-colors"
            >
              <Plus size={14} strokeWidth={2.5} />
              Add transaction
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dim" />
            <input
              className={`${inputClass} pl-8 w-56`}
              placeholder="Search customer, game, notes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select className={inputClass} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            <option value="topup">Cash in (topup)</option>
            <option value="refund">Refund</option>
            <option value="expense">Expense</option>
          </select>
          <select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setQuery("");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
              className="flex items-center gap-1 text-2xs text-dim hover:text-text transition-colors"
            >
              <X size={12} />
              Clear filters
            </button>
          )}
        </div>

        <div className="bg-panel border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-2xs uppercase tracking-wide text-dim border-b border-border">
                <SortHeader label="Date" sortKey="date" active={sortKey} dir={sortDir} onClick={toggleSort} />
                <th className="px-4 py-2.5 font-medium">Customer / note</th>
                <th className="px-4 py-2.5 font-medium">Game</th>
                <th className="px-4 py-2.5 font-medium">Package</th>
                <th className="px-4 py-2.5 font-medium">Method</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <SortHeader label="Amount" sortKey="amount" active={sortKey} dir={sortDir} onClick={toggleSort} align="right" />
                <SortHeader label="Profit" sortKey="profit" active={sortKey} dir={sortDir} onClick={toggleSort} align="right" />
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/60 last:border-0 hover:bg-panel2/50 group">
                  <td className="px-4 py-2.5 num text-2xs text-muted whitespace-nowrap">{formatDateTime(t.date)}</td>
                  <td className="px-4 py-2.5">
                    <div>{t.customerName || "—"}</div>
                    {(t.notes || t.customerContact) && (
                      <div className="text-2xs text-dim">{t.notes || t.customerContact}</div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted">{t.game || "—"}</td>
                  <td className="px-4 py-2.5 text-muted text-2xs">{t.coinPackage || "—"}</td>
                  <td className="px-4 py-2.5 text-muted capitalize text-2xs">{t.paymentMethod?.replace("_", " ")}</td>
                  <td className="px-4 py-2.5">
                    <TypeBadge type={t.type} />
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-2.5 num text-right">{formatMoney(t.amount)}</td>
                  <td className="px-4 py-2.5 num text-right text-good">
                    {t.profit ? formatMoney(t.profit) : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 text-dim hover:text-accent hover:bg-panel2 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(t)}
                        className="p-1.5 text-dim hover:text-bad hover:bg-panel2 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-dim text-sm">
                    No transactions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit transaction" : "Add transaction"}>
        <TransactionForm initial={editing} onDone={() => setFormOpen(false)} />
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete transaction" width="max-w-sm">
        <p className="text-sm text-muted mb-4">
          This will permanently remove this transaction from the ledger. This can't be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setConfirmDelete(null)}
            className="px-4 py-2 text-sm text-muted hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              removeTransaction(confirmDelete.id);
              setConfirmDelete(null);
            }}
            className="px-4 py-2 text-sm bg-bad text-white font-medium hover:bg-bad/90 transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
}

function SortHeader({ label, sortKey, active, dir, onClick, align = "left" }) {
  const isActive = active === sortKey;
  return (
    <th
      className={`px-4 py-2.5 font-medium cursor-pointer select-none hover:text-text transition-colors ${
        align === "right" ? "text-right" : "text-left"
      } ${isActive ? "text-text" : ""}`}
      onClick={() => onClick(sortKey)}
    >
      {label}
      {isActive && <span className="ml-1">{dir === "asc" ? "↑" : "↓"}</span>}
    </th>
  );
}

function csvSafe(value) {
  if (value === undefined || value === null) return "";
  const str = String(value).replace(/"/g, '""');
  return /[,"\n]/.test(str) ? `"${str}"` : str;
}
