// WorkDay Online 2026 — Sidebar Navigation
// Design: Dark sidebar (Slate-900) with Indigo active state

import { BarChart3, Calendar, ClipboardList, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function LogoutButton() {
  const { logout, user } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="px-4 py-4 border-t space-y-3" style={{ borderColor: "var(--sidebar-border)" }}>
      {user && (
        <div className="text-xs px-2 py-1.5 rounded" style={{ background: "var(--sidebar-foreground)", opacity: 0.1 }}>
          <p className="font-semibold text-white truncate">{user.name || user.email || "ผู้ใช้"}</p>
          <p style={{ color: "var(--sidebar-foreground)", opacity: 0.7 }} className="text-xs mt-0.5">
            {user.role === "admin" ? "👤 ผู้ดูแลระบบ" : "👤 ผู้ใช้"}
          </p>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors"
      >
        <LogOut size={16} />
        <span>ออกจากระบบ</span>
      </button>
    </div>
  );
}

const navItems = [
  { id: "dashboard", label: "ภาพรวม", icon: LayoutDashboard },
  { id: "calendar", label: "ปฏิทิน", icon: Calendar },
  { id: "records", label: "รายการงาน", icon: ClipboardList },
  { id: "stats", label: "สถิติ", icon: BarChart3 },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside
      className="flex flex-col w-56 shrink-0 h-screen sticky top-0"
      style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "var(--primary)" }}
          >
            W
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">Work</div>
            <div className="text-xs" style={{ color: "var(--sidebar-foreground)", opacity: 0.6 }}>
              Online
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`nav-item w-full text-left ${isActive ? "active" : ""}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <LogoutButton />
    </aside>
  );
}
