// WorkDay Online 2026 — Calendar View
// Design: Monthly calendar with work day indicators

import { useState } from "react";
import { WorkRecord, MONTHS, MONTH_LABELS, MONTH_NUMBERS, STATUS_LABELS } from "@/lib/data";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  records: WorkRecord[];
}

const DAY_NAMES = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export default function CalendarView({ records }: CalendarViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("ม.ค.");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthIdx = MONTHS.indexOf(selectedMonth as (typeof MONTHS)[number]);
  const monthNum = MONTH_NUMBERS[selectedMonth];
  const year = 2026;

  // Build calendar grid
  const firstDay = new Date(year, monthNum - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  // Records for this month
  const monthRecords = records.filter((r) => r.month === selectedMonth);

  // Map date -> records
  const dateMap: Record<string, WorkRecord[]> = {};
  monthRecords.forEach((r) => {
    const day = r.date.slice(8, 10);
    if (!dateMap[day]) dateMap[day] = [];
    dateMap[day].push(r);
  });

  // Selected day records
  const selectedRecords = selectedDate ? dateMap[selectedDate] || [] : [];

  const prevMonth = () => {
    const idx = MONTHS.indexOf(selectedMonth as (typeof MONTHS)[number]);
    if (idx > 0) setSelectedMonth(MONTHS[idx - 1]);
  };
  const nextMonth = () => {
    const idx = MONTHS.indexOf(selectedMonth as (typeof MONTHS)[number]);
    if (idx < MONTHS.length - 1) setSelectedMonth(MONTHS[idx + 1]);
  };

  const statusColor: Record<string, string> = {
    completed: "#16a34a",
    pending: "#d97706",
    cancelled: "#dc2626",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">ปฏิทินงาน</h1>
          <p className="text-sm text-muted-foreground">แสดงวันที่มีงานบริการ</p>
        </div>
        {/* Month selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            disabled={monthIdx === 0}
            className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-1">
            {MONTHS.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedMonth === m
                    ? "bg-primary text-primary-foreground"
                    : "border border-border hover:bg-muted text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={nextMonth}
            disabled={monthIdx === MONTHS.length - 1}
            className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">{MONTH_LABELS[selectedMonth]}</h2>
          </div>
          <div className="p-4">
            {/* Day names */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-semibold text-muted-foreground py-2"
                >
                  {d}
                </div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = String(i + 1).padStart(2, "0");
                const dayRecords = dateMap[day] || [];
                const hasWork = dayRecords.length > 0;
                const allDone = hasWork && dayRecords.every((r) => r.status === "completed");
                const hasPending = dayRecords.some((r) => r.status === "pending");
                const isSelected = selectedDate === day;
                const isToday =
                  new Date().getFullYear() === year &&
                  new Date().getMonth() + 1 === monthNum &&
                  new Date().getDate() === i + 1;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : day)}
                    className={`relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-lg text-sm transition-all ${
                      isSelected
                        ? "ring-2 ring-primary ring-offset-1"
                        : ""
                    } ${
                      hasWork
                        ? allDone
                          ? "cal-day-completed"
                          : "cal-day-pending"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`text-xs font-medium leading-none ${
                        isToday
                          ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center"
                          : hasWork
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                    {hasWork && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                        {dayRecords.slice(0, 3).map((r, ri) => (
                          <span
                            key={ri}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: statusColor[r.status] }}
                          />
                        ))}
                      </div>
                    )}
                    {dayRecords.length > 3 && (
                      <span className="text-[9px] text-muted-foreground">+{dayRecords.length - 3}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Legend */}
          <div className="px-5 py-3 border-t border-border flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded cal-day-completed inline-block" />
              เสร็จสิ้น
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded cal-day-pending inline-block" />
              รอดำเนินการ
            </span>
          </div>
        </div>

        {/* Day detail */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">
              {selectedDate
                ? `${parseInt(selectedDate)} ${MONTH_LABELS[selectedMonth]}`
                : "เลือกวันที่"}
            </h2>
            {selectedDate && (
              <p className="text-xs text-muted-foreground">{selectedRecords.length} รายการ</p>
            )}
          </div>
          <div className="divide-y divide-border overflow-y-auto max-h-96">
            {!selectedDate && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                คลิกวันที่บนปฏิทินเพื่อดูรายการ
              </div>
            )}
            {selectedDate && selectedRecords.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                ไม่มีรายการในวันนี้
              </div>
            )}
            {selectedRecords.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {r.customer_name || "ลูกค้า"}
                    </p>
                    {r.customer_phone && (
                      <p className="text-xs text-muted-foreground">{r.customer_phone}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 status-${r.status}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>
                {r.product && (
                  <p className="text-xs text-muted-foreground mb-1">
                    <span className="font-medium">อุปกรณ์:</span> {r.product}
                  </p>
                )}
                {r.os && (
                  <p className="text-xs text-muted-foreground mb-1">
                    <span className="font-medium">OS:</span> {r.os}
                  </p>
                )}
                {r.details[0] && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {r.details[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly summary table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">สรุปรายวัน — {MONTH_LABELS[selectedMonth]}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">วันที่</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">ลูกค้า</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">อุปกรณ์</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {monthRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              )}
              {monthRecords.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {r.date.slice(8)}/{r.date.slice(5, 7)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">
                      {r.customer_name || "—"}
                    </p>
                    {r.customer_phone && (
                      <p className="text-xs text-muted-foreground">{r.customer_phone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.product || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full status-${r.status}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
