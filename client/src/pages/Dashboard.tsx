// Design: Swiss International Style + Contemporary SaaS
// Layout: Fixed sidebar (dark) + scrollable main content
// Colors: Indigo-600 primary, Slate tones, Green/Amber status
// Data: Connected to tRPC API for real-time Database sync

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardOverview from "@/components/DashboardOverview";
import CalendarView from "@/components/CalendarView";
import RecordsTable from "@/components/RecordsTable";
import StatsView from "@/components/StatsView";
import { loadRecords, saveRecords, WorkRecord } from "@/lib/data";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const YEARS = [2024, 2025, 2026, 2027, 2028];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load from API Database
  const { data: dbRecords, isLoading: dbLoading, refetch } = trpc.workRecords.list.useQuery(
    { month: selectedMonth },
    { enabled: true }
  );

  // Initialize: Load from localStorage first, then sync with API
  useEffect(() => {
    const initializeData = async () => {
      try {
        // First, load from localStorage as fallback
        const stored = loadRecords();
        setRecords(stored);
        setIsInitializing(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setIsInitializing(false);
      }
    };

    initializeData();
  }, []);

  // Update records when API data changes
  useEffect(() => {
    if (dbRecords && dbRecords.length > 0) {
      // Convert database records to WorkRecord format
      const converted = (dbRecords as any[]).map((r: any) => ({
        id: r.id,
        date: r.date,
        month: r.month,
        customer_name: r.customerName || "",
        customer_phone: r.customerPhone || "",
        product: r.product || "",
        os: r.os || "",
        service_type: r.serviceType || "",
        details: r.details ? r.details.split(",").map((d: string) => d.trim()) : [],
        notes: r.notes ? r.notes.split(",").map((n: string) => n.trim()) : [],
        status: r.status,
        images: [],
      }));
      setRecords(converted);
      // Also save to localStorage for offline access
      saveRecords(converted);
    }
  }, [dbRecords]);

  const handleUpdateRecords = useCallback((updated: WorkRecord[]) => {
    setRecords(updated);
    saveRecords(updated);
    // Refetch from API to ensure sync
    refetch();
  }, [refetch]);

  // Filter records by selected month and year
  const filteredRecords = records.filter((r) => {
    // Check year from date (YYYY-MM-DD)
    const recordYear = parseInt(r.date.slice(0, 4));
    if (recordYear !== selectedYear) return false;
    
    // Check month if selected
    if (selectedMonth && r.month !== selectedMonth) return false;
    
    return true;
  });

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        {/* Month and Year selector */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-foreground">ปี พ.ศ.:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <label className="text-sm font-medium text-foreground ml-4">เลือกเดือน:</label>
            <select
              value={selectedMonth || "all"}
              onChange={(e) => setSelectedMonth(e.target.value === "all" ? undefined : e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
            >
              <option value="all">ทุกเดือน</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {dbLoading && <Loader2 size={16} className="animate-spin text-primary" />}
          </div>
        </div>

        {activeTab === "dashboard" && (
          <DashboardOverview records={filteredRecords} onNavigate={setActiveTab} />
        )}
        {activeTab === "calendar" && (
          <CalendarView records={filteredRecords} />
        )}
        {activeTab === "records" && (
          <RecordsTable records={records} onUpdateRecords={handleUpdateRecords} />
        )}
        {activeTab === "stats" && (
          <StatsView records={filteredRecords} />
        )}
      </main>
    </div>
  );
}
