import { NavLink } from "react-router-dom";
import { LayoutGrid, Receipt, BarChart3, Users, Settings, Gamepad2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSettings } from "../lib/format";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/staff", label: "Staff", icon: Users, adminOnly: true },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const { user } = useAuth();
  const settings = getSettings();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-panel flex flex-col h-full">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
        <div className="w-6 h-6 bg-accent flex items-center justify-center">
          <Gamepad2 size={15} className="text-bg" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold tracking-tight truncate">{settings.shopName}</span>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV.filter((item) => !item.adminOnly || user?.role === "admin").map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-panel2 text-text border-l-2 border-accent -ml-0.5 pl-[11px]"
                  : "text-muted hover:text-text hover:bg-panel2/60 border-l-2 border-transparent"
              }`
            }
          >
            <item.icon size={16} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border text-2xs text-dim">
        <div className="flex justify-between">
          <span>Local storage</span>
          <span className="text-good">● synced</span>
        </div>
      </div>
    </aside>
  );
}
