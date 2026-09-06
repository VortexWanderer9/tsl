import { useState } from "react";
import { Download, Trash2, AlertTriangle } from "lucide-react";
import Topbar from "../components/Topbar";
import Modal from "../components/Modal";
import { getSettings, saveSettings } from "../lib/format";
import { storage } from "../lib/storage";
import { useData } from "../context/DataContext";

const inputClass =
  "w-full bg-panel2 border border-border px-3 py-2 text-sm text-text focus:border-accent transition-colors";

const CURRENCIES = ["NPR", "USD", "INR", "PKR", "BDT"];

export default function Settings() {
  const { transactions, reload } = useData();
  const [settings, setSettings] = useState(getSettings());
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function exportJson() {
    const data = {
      transactions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetData() {
    storage.setList(storage.KEYS.transactions, []);
    storage.setValue(storage.KEYS.seeded, true);
    reload();
    setConfirmReset(false);
  }

  return (
    <>
      <Topbar title="Settings" subtitle="Shop preferences and data" />

      <div className="flex-1 overflow-y-auto px-6 py-5 max-w-xl space-y-5">
        <form onSubmit={handleSave} className="bg-panel border border-border p-5 space-y-4">
          <h3 className="text-sm font-medium">Shop preferences</h3>
          <label className="block">
            <span className="block text-2xs uppercase tracking-wide text-dim mb-1.5">Shop name</span>
            <input
              className={inputClass}
              value={settings.shopName}
              onChange={(e) => setSettings((s) => ({ ...s, shopName: e.target.value }))}
            />
          </label>
          <label className="block">
            <span className="block text-2xs uppercase tracking-wide text-dim mb-1.5">Currency</span>
            <select
              className={inputClass}
              value={settings.currency}
              onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className="px-4 py-2 text-sm bg-accent text-bg font-medium hover:bg-accent/90 transition-colors">
              Save changes
            </button>
            {saved && <span className="text-2xs text-good">Saved — refresh to see it everywhere.</span>}
          </div>
        </form>

        <div className="bg-panel border border-border p-5 space-y-4">
          <h3 className="text-sm font-medium">Data</h3>
          <p className="text-2xs text-dim">
            Everything lives in this browser's local storage. Back it up regularly — clearing
            browser data or switching devices will lose it.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportJson}
              className="flex items-center gap-1.5 border border-border text-muted text-sm px-3 py-1.5 hover:text-text hover:border-borderLight transition-colors"
            >
              <Download size={14} />
              Export full backup (JSON)
            </button>
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 border border-bad/30 text-bad text-sm px-3 py-1.5 hover:bg-bad/10 transition-colors"
            >
              <Trash2 size={14} />
              Clear all transactions
            </button>
          </div>
        </div>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Clear all transactions" width="max-w-sm">
        <div className="flex gap-2 items-start bg-bad/10 border border-bad/30 text-bad text-sm px-3 py-2 mb-4">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <span>This permanently deletes every transaction on this device. Export a backup first if you need one.</span>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setConfirmReset(false)} className="px-4 py-2 text-sm text-muted hover:text-text transition-colors">
            Cancel
          </button>
          <button onClick={resetData} className="px-4 py-2 text-sm bg-bad text-white font-medium hover:bg-bad/90 transition-colors">
            Delete everything
          </button>
        </div>
      </Modal>
    </>
  );
}
