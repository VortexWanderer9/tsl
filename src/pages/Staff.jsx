import { useState } from "react";
import { UserPlus, Trash2, ShieldCheck, Shield } from "lucide-react";
import Topbar from "../components/Topbar";
import Modal from "../components/Modal";
import { createStaff, listUsers, removeStaff } from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../lib/format";

const inputClass =
  "w-full bg-panel2 border border-border px-3 py-2 text-sm text-text focus:border-accent transition-colors";

export default function Staff() {
  const { user } = useAuth();
  const [users, setUsers] = useState(() => listUsers());
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ username: "", name: "", password: "", role: "staff" });
  const [error, setError] = useState("");

  function refresh() {
    setUsers(listUsers());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.username.trim() || !form.name.trim() || form.password.length < 4) {
      setError("Fill in all fields — password needs at least 4 characters.");
      return;
    }
    const res = await createStaff(form);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setForm({ username: "", name: "", password: "", role: "staff" });
    setFormOpen(false);
    refresh();
  }

  function handleDelete() {
    removeStaff(confirmDelete.id);
    setConfirmDelete(null);
    refresh();
  }

  return (
    <>
      <Topbar
        title="Staff"
        subtitle="Accounts that can access this dashboard"
        actions={
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1.5 bg-accent text-bg text-sm font-medium px-3 py-1.5 hover:bg-accent/90 transition-colors"
          >
            <UserPlus size={14} strokeWidth={2.5} />
            Add staff
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="bg-warn/10 border border-warn/30 text-warn text-2xs px-3 py-2 mb-4">
          Accounts live in this browser's local storage only. They won't sync to other devices —
          each staff member needs to be added again on the machine they use.
        </div>

        <div className="bg-panel border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-2xs uppercase tracking-wide text-dim border-b border-border">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Username</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Added</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/60 last:border-0 group">
                  <td className="px-4 py-2.5">{u.name}</td>
                  <td className="px-4 py-2.5 num text-muted">{u.username}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-2xs capitalize">
                      {u.role === "admin" ? (
                        <ShieldCheck size={13} className="text-accent" />
                      ) : (
                        <Shield size={13} className="text-dim" />
                      )}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-2xs text-dim num">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-2.5 text-right">
                    {u.id !== user.id && (
                      <button
                        onClick={() => setConfirmDelete(u)}
                        className="p-1.5 text-dim hover:text-bad hover:bg-panel2 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Add staff account">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-bad/10 border border-bad/30 text-bad text-sm px-3 py-2">{error}</div>}
          <label className="block">
            <span className="block text-2xs uppercase tracking-wide text-dim mb-1.5">Full name</span>
            <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="block">
            <span className="block text-2xs uppercase tracking-wide text-dim mb-1.5">Username</span>
            <input className={inputClass} value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
          </label>
          <label className="block">
            <span className="block text-2xs uppercase tracking-wide text-dim mb-1.5">Password</span>
            <input type="password" className={inputClass} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </label>
          <label className="block">
            <span className="block text-2xs uppercase tracking-wide text-dim mb-1.5">Role</span>
            <select className={inputClass} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm text-muted hover:text-text transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-accent text-bg font-medium hover:bg-accent/90 transition-colors">
              Add account
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Remove staff account" width="max-w-sm">
        <p className="text-sm text-muted mb-4">
          {confirmDelete?.name} will no longer be able to sign in on this device.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-muted hover:text-text transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-bad text-white font-medium hover:bg-bad/90 transition-colors">
            Remove
          </button>
        </div>
      </Modal>
    </>
  );
}
