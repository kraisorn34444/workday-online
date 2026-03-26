// WorkDay Online 2026 — Export Utilities
// สำหรับ export ข้อมูลเป็น Excel และ CSV

import * as XLSX from "xlsx";
import { WorkRecord, MONTH_LABELS, STATUS_LABELS } from "./data";

/**
 * แปลง WorkRecord เป็นแถวข้อมูลสำหรับ export
 */
function recordToRow(record: WorkRecord): Record<string, any> {
  return {
    "ลำดับที่": record.id,
    "วันที่": record.date,
    "เดือน": MONTH_LABELS[record.month],
    "ชื่อลูกค้า": record.customer_name || "—",
    "เบอร์โทร": record.customer_phone || "—",
    "อุปกรณ์": record.product || "—",
    "ระบบปฏิบัติการ": record.os || "—",
    "ประเภทบริการ": record.service_type || "—",
    "รายละเอียด": record.details.join(" | ") || "—",
    "หมายเหตุ": record.notes.join(" | ") || "—",
    "สถานะ": STATUS_LABELS[record.status],
  };
}

/**
 * Export ข้อมูลเป็น Excel (.xlsx)
 */
export function exportToExcel(records: WorkRecord[], filename: string = "WorkDay_Online_2026.xlsx") {
  const rows = records.map(recordToRow);

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // ตั้งค่าความกว้างของคอลัมน์
  const colWidths = [
    { wch: 8 },   // ลำดับที่
    { wch: 12 },  // วันที่
    { wch: 15 },  // เดือน
    { wch: 18 },  // ชื่อลูกค้า
    { wch: 15 },  // เบอร์โทร
    { wch: 15 },  // อุปกรณ์
    { wch: 15 },  // ระบบปฏิบัติการ
    { wch: 20 },  // ประเภทบริการ
    { wch: 30 },  // รายละเอียด
    { wch: 30 },  // หมายเหตุ
    { wch: 12 },  // สถานะ
  ];
  worksheet["!cols"] = colWidths;

  // สร้าง workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "WorkDay 2026");

  // ดาวน์โหลด
  XLSX.writeFile(workbook, filename);
}

/**
 * Export ข้อมูลเป็น CSV
 */
export function exportToCSV(records: WorkRecord[], filename: string = "WorkDay_Online_2026.csv") {
  const rows = records.map(recordToRow);

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  // สร้าง Blob และดาวน์โหลด
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for UTF-8
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export ข้อมูลที่กรองแล้วเป็น Excel/CSV
 */
export function exportFilteredRecords(
  records: WorkRecord[],
  format: "excel" | "csv" = "excel",
  filterMonth?: string,
  filterStatus?: string
) {
  let filtered = records;

  if (filterMonth && filterMonth !== "ทั้งหมด") {
    filtered = filtered.filter((r) => r.month === filterMonth);
  }

  if (filterStatus && filterStatus !== "ทั้งหมด") {
    filtered = filtered.filter((r) => r.status === filterStatus);
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename =
    format === "excel"
      ? `WorkDay_Online_${timestamp}.xlsx`
      : `WorkDay_Online_${timestamp}.csv`;

  if (format === "excel") {
    exportToExcel(filtered, filename);
  } else {
    exportToCSV(filtered, filename);
  }
}
