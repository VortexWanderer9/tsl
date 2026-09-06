import { useState } from "react";
import { useData } from "../context/DataContext";

const PAYMENT_METHODS = [
  { value: "esewa", label: "eSewa" },
  { value: "khalti", label: "Khalti" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "crypto", label: "Crypto" },
  { value: "other", label: "Other" },
];

const EMPTY = {
  type: "topup",
  status: "completed",
  customerName: "",
  customerContact: "",
  game: "",
  coinPackage: "",
  amount: "",
  costPrice: "",
  paymentMethod: "esewa",
  notes: "",
  date: new Date().toISOString().slice(0, 16),
};

function field(label, children) {
  return (
    <label className="block">
      <span className="block text-2xs uppercase tracking-wide text-dim mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full bg-panel2 border border-border px-3 py-2 text-sm text-text placeholder:text-dim focus:border-accent transition-colors";

export default function TransactionForm({ initial, onDone }) {
  const { addTransaction, updateTransaction, games } = useData();
  const [form, setForm] = useState(() =>
    initial
      ? {
          ...initial,
          amount: String(initial.amount ?? ""),
          costPrice: String(initial.costPrice ?? ""),
          date: initial.date ? initial.date.slice(0, 16) : EMPTY.date,
        }
      : EMPTY
  );
  const [error, setError] = useState("");

  const isExpense = form.type === "expense";
  const isOrder = form.type === "topup" || form.type === "refund";

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    if (isOrder && !form.customerName.trim()) {
      setError("Customer name is required for a topup or refund.");
      return;
    }

    const costPrice = parseFloat(form.costPrice) || 0;
    const profit =
      form.type === "topup" && form.status === "completed"
        ? Math.round((amount - costPrice) * 100) / 100
        : 0;

    const payload = {
      type: form.type,
      status: form.status,
      customerName: isOrder ? form.customerName.trim() : "",
      customerContact: isOrder ? form.customerContact.trim() : "",
      game: isOrder ? form.game.trim() : "",
      coinPackage: isOrder ? form.coinPackage.trim() : "",
      amount,
      costPrice: form.type === "topup" ? costPrice : 0,
      profit,
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim(),
      date: new Date(form.date).toISOString(),
    };

    if (initial) {
      updateTransaction(initial.id, payload);
    } else {
      addTransaction(payload);
    }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-bad/10 border border-bad/30 text-bad text-sm px-3 py-2">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {field(
          "Type",
          <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value)}>
            <option value="topup">Topup (cash in)</option>
            <option value="refund">Refund (cash out)</option>
            <option value="expense">Expense (cash out)</option>
          </select>
        )}
        {field(
          "Status",
          <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            {form.type === "refund" && <option value="refunded">Refunded</option>}
          </select>
        )}
      </div>

      {isOrder && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {field(
              "Customer name",
              <input
                className={inputClass}
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                placeholder="e.g. Anish Sharma"
              />
            )}
            {field(
              "Contact (optional)",
              <input
                className={inputClass}
                value={form.customerContact}
                onChange={(e) => set("customerContact", e.target.value)}
                placeholder="98XXXXXXXX"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field(
              "Game",
              <input
                className={inputClass}
                value={form.game}
                onChange={(e) => set("game", e.target.value)}
                placeholder="e.g. Free Fire"
                list="games-list"
              />
            )}
            {field(
              "Coin package",
              <input
                className={inputClass}
                value={form.coinPackage}
                onChange={(e) => set("coinPackage", e.target.value)}
                placeholder="e.g. 520 Diamonds"
              />
            )}
          </div>
          <datalist id="games-list">
            {games.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        {field(
          `Amount ${isExpense ? "" : "(charged)"}`,
          <input
            className={`${inputClass} num`}
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            placeholder="0.00"
          />
        )}
        {form.type === "topup" &&
          field(
            "Cost price (supplier)",
            <input
              className={`${inputClass} num`}
              type="number"
              step="0.01"
              min="0"
              value={form.costPrice}
              onChange={(e) => set("costPrice", e.target.value)}
              placeholder="0.00"
            />
          )}
        {form.type !== "topup" &&
          field(
            "Payment method",
            <select
              className={inputClass}
              value={form.paymentMethod}
              onChange={(e) => set("paymentMethod", e.target.value)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          )}
      </div>

      {form.type === "topup" && (
        <div className="grid grid-cols-2 gap-3">
          {field(
            "Payment method",
            <select
              className={inputClass}
              value={form.paymentMethod}
              onChange={(e) => set("paymentMethod", e.target.value)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          )}
          {field(
            "Date & time",
            <input
              className={`${inputClass} num`}
              type="datetime-local"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          )}
        </div>
      )}

      {form.type !== "topup" &&
        field(
          "Date & time",
          <input
            className={`${inputClass} num`}
            type="datetime-local"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
        )}

      {field(
        "Notes (optional)",
        <textarea
          className={inputClass}
          rows={2}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder={isExpense ? "e.g. Supplier balance reload" : "Anything worth remembering"}
        />
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2 text-sm text-muted hover:text-text transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-accent text-bg font-medium hover:bg-accent/90 transition-colors"
        >
          {initial ? "Save changes" : "Add transaction"}
        </button>
      </div>
    </form>
  );
}
