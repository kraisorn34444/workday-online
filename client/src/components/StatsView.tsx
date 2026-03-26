// WorkDay Online 2026 — Statistics View
// Design: Charts using Recharts + summary cards

import { WorkRecord, MONTH_LABELS, STATUS_LABELS } from "@/lib/data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface StatsViewProps {
  records: WorkRecord[];
}

const INDIGO = "oklch(0.511 0.262 276.966)";
const GREEN = "#16a34a";
const AMBER = "#d97706";
const RED = "#dc2626";

export default function StatsView({ records }: StatsViewProps) {
  const total = records.length;
  const completed = records.filter((r) => r.status === "completed").length;
  const pending = records.filter((r) => r.status === "pending").length;
  const cancelled = records.filter((r) => r.status === "cancelled").length;

  // By month
  const monthData = ["ม.ค.", "ก.พ.", "มี.ค."].map((m) => {
    const mr = records.filter((r) => r.month === m);
    return {
      name: m,
      total: mr.length,
      เสร็จสิ้น: mr.filter((r) => r.status === "completed").length,
      รอดำเนินการ: mr.filter((r) => r.status === "pending").length,
    };
  });

  // By product
  const productMap: Record<string, number> = {};
  records.forEach((r) => {
    const p = r.product || "ไม่ระบุ";
    productMap[p] = (productMap[p] || 0) + 1;
  });
  const productData = Object.entries(productMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // By OS
  const osMap: Record<string, number> = {};
  records.forEach((r) => {
    const o = r.os || "ไม่ระบุ";
    osMap[o] = (osMap[o] || 0) + 1;
  });
  const osData = Object.entries(osMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  // Status pie
  const statusData = [
    { name: "เสร็จสิ้น", value: completed, color: GREEN },
    { name: "รอดำเนินการ", value: pending, color: AMBER },
    ...(cancelled > 0 ? [{ name: "ยกเลิก", value: cancelled, color: RED }] : []),
  ];

  const PRODUCT_COLORS = [
    "#4f46e5", "#7c3aed", "#2563eb", "#0891b2", "#059669",
    "#d97706", "#dc2626", "#9333ea",
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">สถิติและรายงาน</h1>
        <p className="text-sm text-muted-foreground">ข้อมูลรวม ม.ค.–มี.ค. 2026</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "รายการทั้งหมด", value: total, color: "#4f46e5" },
          { label: "เสร็จสิ้น", value: completed, color: GREEN },
          { label: "รอดำเนินการ", value: pending, color: AMBER },
          {
            label: "อัตราสำเร็จ",
            value: `${total > 0 ? Math.round((completed / total) * 100) : 0}%`,
            color: "#4f46e5",
          },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="stat-number text-3xl font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly bar chart */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h2 className="font-semibold text-foreground mb-4">รายการต่อเดือน</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthData} barSize={28} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="เสร็จสิ้น" fill={GREEN} radius={[4, 4, 0, 0]} />
              <Bar dataKey="รอดำเนินการ" fill={AMBER} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h2 className="font-semibold text-foreground mb-4">สัดส่วนสถานะ</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product bar */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h2 className="font-semibold text-foreground mb-4">อุปกรณ์ที่ให้บริการ</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={productData} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" name="จำนวน" radius={[0, 4, 4, 0]}>
                {productData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* OS breakdown */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h2 className="font-semibold text-foreground mb-4">ระบบปฏิบัติการ</h2>
          <div className="space-y-3 mt-2">
            {osData.map((item, i) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{item.name}</span>
                    <span className="stat-number text-muted-foreground font-semibold">
                      {item.value} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: PRODUCT_COLORS[i % PRODUCT_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">สรุปรายเดือน</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">เดือน</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">ทั้งหมด</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">เสร็จสิ้น</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">รอดำเนินการ</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">อัตราสำเร็จ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {["ม.ค.", "ก.พ.", "มี.ค."].map((m) => {
                const mr = records.filter((r) => r.month === m);
                const c = mr.filter((r) => r.status === "completed").length;
                const p = mr.filter((r) => r.status === "pending").length;
                const rate = mr.length > 0 ? Math.round((c / mr.length) * 100) : 0;
                return (
                  <tr key={m} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{MONTH_LABELS[m]}</td>
                    <td className="px-4 py-3 text-center stat-number font-semibold text-foreground">
                      {mr.length}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="stat-number font-semibold" style={{ color: GREEN }}>
                        {c}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="stat-number font-semibold" style={{ color: AMBER }}>
                        {p}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${rate}%`, background: GREEN }}
                          />
                        </div>
                        <span className="stat-number text-xs font-semibold text-muted-foreground">
                          {rate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr className="bg-muted/40 font-semibold">
                <td className="px-5 py-3 text-foreground">รวมทั้งหมด</td>
                <td className="px-4 py-3 text-center stat-number text-foreground">{total}</td>
                <td className="px-4 py-3 text-center stat-number" style={{ color: GREEN }}>
                  {completed}
                </td>
                <td className="px-4 py-3 text-center stat-number" style={{ color: AMBER }}>
                  {pending}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="stat-number text-sm font-bold text-primary">
                    {total > 0 ? Math.round((completed / total) * 100) : 0}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
