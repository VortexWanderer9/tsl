import { useState } from "react";
import { Gamepad2, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSettings } from "../lib/format";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const settings = getSettings();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (!res.ok) setError(res.error);
  }

  return (
    <div className="h-screen w-screen bg-bg text-text flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 bg-accent flex items-center justify-center">
            <Gamepad2 size={18} className="text-bg" strokeWidth={2.5} />
          </div>
          <span className="text-base font-semibold tracking-tight">{settings.shopName}</span>
        </div>

        <div className="bg-panel border border-border p-6">
          <h1 className="text-sm font-medium mb-1">Sign in</h1>
          <p className="text-2xs text-dim mb-5">Access the transaction ledger</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-bad/10 border border-bad/30 text-bad text-sm px-3 py-2">{error}</div>
            )}
            <label className="block">
              <span className="block text-2xs uppercase tracking-wide text-dim mb-1.5">Username</span>
              <input
                autoFocus
                className="w-full bg-panel2 border border-border px-3 py-2 text-sm focus:border-accent transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
              />
            </label>
            <label className="block">
              <span className="block text-2xs uppercase tracking-wide text-dim mb-1.5">Password</span>
              <input
                type="password"
                className="w-full bg-panel2 border border-border px-3 py-2 text-sm focus:border-accent transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-accent text-bg font-medium text-sm py-2.5 hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Sign in
            </button>
          </form>
        </div>

        <p className="text-2xs text-dim text-center mt-4 num">
          default admin — admin / admin123
        </p>
      </div>
    </div>
  );
}
