import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardOverview from "@/components/DashboardOverview";
import CalendarView from "@/components/CalendarView";
import RecordsTable from "@/components/RecordsTable";
import StatsView from "@/components/StatsView";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth"; // ✅ นำเข้า useAuth มาเช็คสิทธิ์

const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const YEARS = [2024, 2025, 2026, 2027, 2028];

export default function Dashboard() {
  const { isAuthenticated } = useAuth(); // ✅ ตรวจสอบว่า Login จริงหรือไม่
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // 1. ดึงข้อมูลจาก API Database (จะทำงานเมื่อ isAuthenticated เป็น true เท่านั้น)
  const { data: dbRecords, isLoading, refetch } = trpc.workRecords.list.useQuery(
    { month: selectedMonth },
    { 
      enabled: isAuthenticated, // ✅ ป้องกันการดึงข้อมูลถ้ายังไม่ได้ Login
      retry: false 
    }
  );

  // 2. แปลงข้อมูลจาก Database เป็น Format ที่ Component ต้องการ
  const records = (dbRecords || []).map((r: any) => ({
    id: r.id,
    date: r.date,
    month: r.month,
    customer_name: r.customerName || "",
    customer_phone: r.customerPhone || "",
    product: r.product || "",
    os: r.os || "",
    service_type: r.serviceType || "",
    details: typeof r.details === 'string' ? r.details.split(",") : [],
    notes: typeof r.notes === 'string' ? r.notes.split(",") : [],
    status: r.status,
    images: [],
  }));

  const handleUpdateRecords = useCallback(() => {
    refetch(); // สั่งโหลดข้อมูลใหม่จาก DB เมื่อมีการแก้ไข
  }, [refetch]);

  // Filter ข้อมูลตามปีและเดือนที่เลือก
  const filteredRecords = records.filter((r) => {
    const recordYear = parseInt(r.date.slice(0, 4));
    if (recordYear !== selectedYear) return false;
    if (selectedMonth && r.month !== selectedMonth) return false;
    return true;
  });

  // ถ้ากำลังโหลดข้อมูลครั้งแรก
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูลจากฐานข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">ปี พ.ศ.:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg border border-border bg-card text-sm"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>

            <label className="text-sm font-medium ml-4">เลือกเดือน:</label>
            <select
              value={selectedMonth || "all"}
              onChange={(e) => setSelectedMonth(e.target.value === "all" ? undefined : e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-card text-sm"
            >
              <option value="all">ทุกเดือน</option>
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {activeTab === "dashboard" && <DashboardOverview records={filteredRecords} onNavigate={setActiveTab} />}
        {activeTab === "calendar" && <CalendarView records={filteredRecords} />}
        {activeTab === "records" && <RecordsTable records={records} onUpdateRecords={handleUpdateRecords} />}
        {activeTab === "stats" && <StatsView records={filteredRecords} />}
      </main>
    </div>
  );
}