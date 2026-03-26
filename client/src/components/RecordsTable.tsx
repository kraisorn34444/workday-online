// Design: Clean table with add/edit/delete modal
// Connected to tRPC API for Database persistence

import { useState, useEffect, useCallback } from "react";
import {
  WorkRecord,
  WorkImage,
  WorkStatus,
  Month,
  MONTHS,
  MONTH_LABELS,
  STATUS_LABELS,
  PRODUCTS,
  OS_LIST,
  getNextId,
} from "@/lib/data";
import { exportFilteredRecords } from "@/lib/export";
import ImageUploader from "./ImageUploader";
import ImageGallery from "./ImageGallery";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Plus,
  Trash2,
  Pencil,
  Search,
  X,
  ChevronDown,
  Save,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface RecordsTableProps {
  records: WorkRecord[];
  onUpdateRecords: (records: WorkRecord[]) => void;
}

const emptyForm: Omit<WorkRecord, "id"> = {
  date: new Date().toISOString().slice(0, 10),
  month: "ม.ค.",
  customer_name: "",
  customer_phone: "",
  product: "",
  os: "",
  service_type: "รีโมทติดตั้ง/ตั้งค่า",
  details: [],
  notes: [],
  status: "pending",
  images: [],
};

export default function RecordsTable({ records, onUpdateRecords }: RecordsTableProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [filterMonth, setFilterMonth] = useState<string>("ทั้งหมด");
  const [filterStatus, setFilterStatus] = useState<string>("ทั้งหมด");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<WorkRecord | null>(null);
  const [form, setForm] = useState<Omit<WorkRecord, "id">>(emptyForm);
  const [detailsText, setDetailsText] = useState("");
  const [notesText, setNotesText] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<WorkImage[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // tRPC mutations
  const createMutation = trpc.workRecords.create.useMutation();
  const updateMutation = trpc.workRecords.update.useMutation();
  const deleteMutation = trpc.workRecords.delete.useMutation();
  const utils = trpc.useUtils();

  // Filter
  const filtered = records.filter((r) => {
    if (filterMonth !== "ทั้งหมด" && r.month !== filterMonth) return false;
    if (filterStatus !== "ทั้งหมด" && r.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.customer_name.toLowerCase().includes(q) ||
        r.customer_phone.includes(q) ||
        r.product.toLowerCase().includes(q) ||
        r.details.some((d) => d.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const openAdd = () => {
    if (!isAdmin) {
      toast.error("เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเพิ่มรายการได้");
      return;
    }
    setEditRecord(null);
    setForm(emptyForm);
    setDetailsText("");
    setNotesText("");
    setShowModal(true);
  };

  const openEdit = (r: WorkRecord) => {
    if (!isAdmin) {
      toast.error("เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถแก้ไขรายการได้");
      return;
    }
    setEditRecord(r);
    setForm({
      date: r.date,
      month: r.month,
      customer_name: r.customer_name,
      customer_phone: r.customer_phone,
      product: r.product,
      os: r.os,
      service_type: r.service_type,
      details: r.details,
      notes: r.notes,
      status: r.status,
      images: r.images,
    });
    setDetailsText(r.details.join("\n"));
    setNotesText(r.notes.join("\n"));
    setShowModal(true);
  };

  const handleSave = async () => {
    const details = detailsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const notes = notesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!form.date) {
      toast.error("กรุณาระบุวันที่");
      return;
    }

    setIsSaving(true);
    try {
      if (editRecord) {
        // Update existing record
        await updateMutation.mutateAsync({
          id: editRecord.id,
          date: form.date,
          month: form.month,
          customerName: form.customer_name,
          customerPhone: form.customer_phone,
          product: form.product,
          os: form.os,
          serviceType: form.service_type,
          details: details.join(", "),
          notes: notes.join(", "),
          status: form.status as WorkStatus,
        });
        toast.success("แก้ไขรายการสำเร็จ");
      } else {
        // Create new record
        await createMutation.mutateAsync({
          date: form.date,
          month: form.month,
          customerName: form.customer_name,
          customerPhone: form.customer_phone,
          product: form.product,
          os: form.os,
          serviceType: form.service_type,
          details: details.join(", "),
          notes: notes.join(", "),
          status: form.status as WorkStatus,
        });
        toast.success("เพิ่มรายการสำเร็จ");
      }

      // Invalidate and refetch data
      await utils.workRecords.list.invalidate();
      setShowModal(false);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsSaving(true);
    try {
      await deleteMutation.mutateAsync({ id });
      await utils.workRecords.list.invalidate();
      setDeleteConfirm(null);
      toast.success("ลบรายการสำเร็จ");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-set month from date
  const handleDateChange = (date: string) => {
    const month = parseInt(date.slice(5, 7));
    const monthMap: Record<number, Month> = { 1: "ม.ค.", 2: "ก.พ.", 3: "มี.ค." };
    setForm((f) => ({
      ...f,
      date,
      month: monthMap[month] || f.month,
    }));
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">รายการงาน</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} รายการ</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <button
              onClick={() => {
                exportFilteredRecords(records, "excel", filterMonth, filterStatus);
                toast.success("ดาวน์โหลด Excel สำเร็จ");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded transition-colors"
              title="Export เป็น Excel"
            >
              <Download size={14} />
              Excel
            </button>
            <div className="w-px h-5 bg-border" />
            <button
              onClick={() => {
                exportFilteredRecords(records, "csv", filterMonth, filterStatus);
                toast.success("ดาวน์โหลด CSV สำเร็จ");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded transition-colors"
              title="Export เป็น CSV"
            >
              <Download size={14} />
              CSV
            </button>
          </div>
          {isAdmin && (
          <button
            onClick={openAdd}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            เพิ่มรายการ
          </button>
        )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <input
          type="text"
          placeholder="ค้นหา..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm flex-1 min-w-[200px]"
        />
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
        >
          <option>ทั้งหมด</option>
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
        >
          <option>ทั้งหมด</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-foreground">วันที่</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">ลูกค้า</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">อุปกรณ์</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">OS</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">บริการ</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">สถานะ</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">ภาพ</th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">การกระทำ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-foreground">{r.date}</td>
                  <td className="px-4 py-3 text-foreground">
                    <div>{r.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{r.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground text-xs">{r.product}</td>
                  <td className="px-4 py-3 text-foreground text-xs">{r.os}</td>
                  <td className="px-4 py-3 text-foreground text-xs">{r.service_type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        r.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : r.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.images && r.images.length > 0 ? (
                      <button
                        onClick={() => {
                          setGalleryImages(r.images);
                          setGalleryOpen(true);
                        }}
                        className="text-primary hover:underline text-xs font-medium"
                      >
                        {r.images.length} ภาพ
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => openEdit(r)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                        >
                          <Pencil size={12} />
                          แก้ไข
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(r.id)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                          ลบ
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">ดูเท่านั้น</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editRecord ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                disabled={isSaving}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">วันที่</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">เดือน</label>
                  <select
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value as Month })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">ชื่อลูกค้า</label>
                  <input
                    type="text"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">เบอร์โทร</label>
                  <input
                    type="tel"
                    value={form.customer_phone}
                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">อุปกรณ์</label>
                  <select
                    value={form.product}
                    onChange={(e) => setForm({ ...form, product: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="">เลือกอุปกรณ์</option>
                    {PRODUCTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">OS</label>
                  <select
                    value={form.os}
                    onChange={(e) => setForm({ ...form, os: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="">เลือก OS</option>
                    {OS_LIST.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">ประเภทบริการ</label>
                <input
                  type="text"
                  value={form.service_type}
                  onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">รายละเอียด</label>
                <textarea
                  value={detailsText}
                  onChange={(e) => setDetailsText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  placeholder="แต่ละรายการแยกด้วย Enter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">หมายเหตุ</label>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  placeholder="แต่ละรายการแยกด้วย Enter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">สถานะ</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as WorkStatus })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">แนบภาพ</label>
                <ImageUploader
                  images={form.images}
                  onImagesChange={(images) => setForm({ ...form, images })}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">ยืนยันการลบ</h3>
            <p className="text-muted-foreground mb-6">คุณแน่ใจว่าต้องการลบรายการนี้หรือไม่?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {galleryOpen && (
        <ImageGallery
          images={galleryImages}
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
}
