// WorkDay Online 2026 — Dashboard Overview
// Design: Stats cards + recent records + mini summary

import { WorkRecord, MONTH_LABELS, STATUS_LABELS } from "@/lib/data";
import { CheckCircle2, Clock, Calendar, TrendingUp, ArrowRight } from "lucide-react";

interface DashboardOverviewProps {
  records: WorkRecord[];
  onNavigate: (tab: string) => void;
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="stat-number text-3xl font-bold" style={{ color }}>
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: color + "18" }}
        >
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverview({ records, onNavigate }: DashboardOverviewProps) {
  const total = records.length;
  const completed = records.filter((r) => r.status === "completed").length;
  const pending = records.filter((r) => r.status === "pending").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // By month
  const byMonth = ["ม.ค.", "ก.พ.", "มี.ค."].map((m) => ({
    month: m,
    label: MONTH_LABELS[m],
    total: records.filter((r) => r.month === m).length,
    completed: records.filter((r) => r.month === m && r.status === "completed").length,
  }));

  // Recent records (last 8)
  const recent = [...records]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  const statusColor: Record<string, string> = {
    completed: "var(--status-completed, #16a34a)",
    pending: "var(--status-pending, #d97706)",
    cancelled: "var(--status-cancelled, #dc2626)",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, oklch(0.511 0.262 276.966) 0%, oklch(0.42 0.22 264) 100%)",
        }}
      >
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Work Online</h1>
          <p className="text-white/80 text-sm">ระบบจัดการงานบริการลูกค้า</p>
        </div>
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663474678944/6pgxDTjqF9f8aeJgFqypbb/hero-bg-VQc4x7hq4tjLnXbR4LL2aE.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="รายการทั้งหมด"
          value={total}
          sub="ม.ค.–มี.ค. 2026"
          color="oklch(0.511 0.262 276.966)"
          icon={Calendar}
        />
        <StatCard
          label="เสร็จสิ้น"
          value={completed}
          sub={`${completionRate}% ของทั้งหมด`}
          color="oklch(0.527 0.154 150.069)"
          icon={CheckCircle2}
        />
        <StatCard
          label="รอดำเนินการ"
          value={pending}
          sub="ยังไม่เสร็จ"
          color="oklch(0.65 0.18 70)"
          icon={Clock}
        />
        <StatCard
          label="อัตราสำเร็จ"
          value={`${completionRate}%`}
          sub="completion rate"
          color="oklch(0.511 0.262 276.966)"
          icon={TrendingUp}
        />
      </div>

      {/* Monthly breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {byMonth.map((m) => {
          const rate = m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0;
          return (
            <div key={m.month} className="bg-card rounded-xl p-5 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.total} รายการ</p>
                </div>
                <span className="stat-number text-2xl font-bold text-primary">{m.total}</span>
              </div>
              <div className="flex gap-3 text-xs mb-3">
                <span className="flex items-center gap-1" style={{ color: "oklch(0.527 0.154 150.069)" }}>
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  เสร็จ {m.completed}
                </span>
                <span className="flex items-center gap-1" style={{ color: "oklch(0.65 0.18 70)" }}>
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  รอ {m.total - m.completed}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${rate}%`,
                    background: "oklch(0.527 0.154 150.069)",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 text-right">{rate}%</p>
            </div>
          );
        })}
      </div>

      {/* Recent records */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">รายการล่าสุด</h2>
          <button
            onClick={() => onNavigate("records")}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            ดูทั้งหมด <ArrowRight size={12} />
          </button>
        </div>
        <div className="divide-y divide-border">
          {recent.map((r) => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40 transition-colors">
              <div className="w-20 shrink-0">
                <span className="text-xs font-mono text-muted-foreground">
                  {r.date.slice(5).replace("-", "/")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {r.customer_name || r.details[0]?.slice(0, 40) || "—"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {r.product || r.service_type || "—"}
                </p>
              </div>
              <div className="shrink-0">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium status-${r.status}`}
                >
                  {STATUS_LABELS[r.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
