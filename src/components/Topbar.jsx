import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title, subtitle, actions }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 shrink-0 border-b border-border bg-bg/95 backdrop-blur flex items-center justify-between px-6">
      <div>
        <h1 className="text-[15px] font-semibold leading-none">{title}</h1>
        {subtitle && <p className="text-2xs text-dim mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {actions}
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm leading-none">{user?.name}</div>
            <div className="text-2xs text-dim mt-0.5 capitalize">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-dim hover:text-bad hover:bg-panel2 transition-colors"
            title="Log out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
