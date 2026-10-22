"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Download, Loader2, LockKeyhole, Plus, Trash2, Upload, UserRound } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getTeacherTutoringSlots, mutateTutoringSlot } from "@/app/actions/tutoring";
import { normalizeImportRows, tutoringBatch, type ImportRow } from "@/lib/tutoring/import";
import type { TutoringSlot } from "@/types/tutoring";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { tutoringTemplateRows } from "@/lib/tutoring/template";

const inputClass = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-500";
const buttonBase = "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-50";
const buttonClass = `${buttonBase} border-slate-200 bg-white text-slate-700 hover:bg-slate-100`;
const primaryClass = `${buttonBase} border-slate-900 bg-slate-900 text-white shadow-sm hover:bg-slate-800`;
const thisMonth = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit" }).format(new Date());
const dateLabel = (date: string) => new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(`${date}T12:00:00+07:00`));

export function TutoringManagementDialog({ userId }: { userId?: string }) {
  const [open, setOpen] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}>
    <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white/80 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100">
      <CalendarPlus className="size-4" />Quản lý dò bài
    </button>
    <DialogContent className="max-h-[94dvh] w-[calc(100%-1rem)] max-w-none overflow-y-auto rounded-[28px] bg-slate-50 p-4 sm:max-w-7xl sm:p-7">
      <DialogTitle className="sr-only">Quản lý dò bài</DialogTitle>
      <DialogDescription className="sr-only">Cấu hình lịch dò bài và quản lý học sinh đặt chỗ.</DialogDescription>
      {open && userId && <TeacherTutoringManager userId={userId} />}
    </DialogContent>
  </Dialog>;
}

export function TeacherTutoringManager({ initialMonth, userId }: { initialMonth?: string; userId: string }) {
  const [month, setMonth] = useState(initialMonth ?? thisMonth);
  const queryClient = useQueryClient();
  const schedule = useQuery({
    queryKey: ["teacher-tutoring-slots", userId, month, "summary"],
    queryFn: async () => {
      const result = await getTeacherTutoringSlots(month);
      if (result.error) throw new Error(result.error);
      return { slots: result.slots, unbookedCount: result.unbookedCount ?? 0 };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (schedule.isError) toast.error("Không thể tải lịch. Vui lòng thử lại.", { id: "tutoring-result" });
  }, [schedule.isError, schedule.errorUpdatedAt]);
  const slots = schedule.data?.slots ?? [];
  const loading = schedule.isPending;
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [reading, setReading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [start, setStart] = useState("20:00");
  const [end, setEnd] = useState("20:30");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const drag = useRef<{ anchor: number; base: Set<string>; add: boolean } | null>(null);
  useEffect(() => {
    const stop = () => { drag.current = null; };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("blur", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      window.removeEventListener("blur", stop);
    };
  }, []);
  useEffect(() => { setSelected(new Set()); drag.current = null; }, [month]);
  const chosen = slots.filter(slot => selected.has(slot.id));
  function toggleSelected(id: string) {
    setSelected(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id); else if (next.size < 500) next.add(id);
      return next;
    });
  }
  function selectRange(index: number) {
    const current = drag.current;
    if (!current) return;
    const next = new Set(current.base);
    for (let i = Math.min(current.anchor, index); i <= Math.max(current.anchor, index); i++) {
      if (current.add) { if (next.size < 500) next.add(slots[i].id); } else next.delete(slots[i].id);
    }
    setSelected(next);
  }
  function bulk(action: "delete" | "lock" | "release") {
    if (!chosen.length) return;
    const form = new FormData();
    form.set("operation", "bulk"); form.set("bulk_action", action);
    form.set("selection", JSON.stringify(chosen.map(({ id, student_id }) => ({ id, student_id }))));
    void mutate(form);
  }
  async function load() {
    await schedule.refetch();
  }
  async function mutate(form: FormData) {
    setBusy(true);
    try {
      const result = await mutateTutoringSlot(form);
      if (!result.ok) {
        toast.error(result.message, { id: "tutoring-result" });
        await queryClient.invalidateQueries({ queryKey: ["teacher-tutoring-slots", userId] });
        return;
      }
      toast.success(form.get("operation") === "delete" || form.get("bulk_action") === "delete" ? "Đã xóa" : "Đã cập nhật", { id: "tutoring-result" }); setCreateOpen(false); setImportOpen(false); setRows([]);
      setSelected(new Set()); drag.current = null;
      await queryClient.invalidateQueries({ queryKey: ["teacher-tutoring-slots", userId] });
    } catch { toast.error("Không thể cập nhật lịch. Vui lòng thử lại.", { id: "tutoring-result" }); }
    finally { setBusy(false); }
  }
  function act(operation: string, slot: TutoringSlot) {
    const form = new FormData();
    form.set("operation", operation); form.set("id", slot.id);
    form.set("student_id", slot.student_id ?? ""); form.set("active", String(!slot.is_active));
    void mutate(form);
  }
  async function downloadTemplate() {
    setDownloadingTemplate(true);
    try {
      const XLSX = await import("xlsx");
      const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
      const sheet = XLSX.utils.aoa_to_sheet(tutoringTemplateRows(today));
      sheet["!cols"] = [{ wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 40 }];
      sheet["!autofilter"] = { ref: "A1:D13" };
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "Ca do bai");
      XLSX.writeFile(workbook, "mau-ca-do-bai.xlsx", { bookType: "xlsx", compression: true });
    } catch {
      toast.error("Không thể tải tệp mẫu. Vui lòng thử lại.", { id: "tutoring-result" });
    } finally { setDownloadingTemplate(false); }
  }
  async function readFile(file?: File) {
    setRows([]);
    if (!file) return;
    if (!/\.(xlsx?|csv)$/i.test(file.name) || file.size > 5 * 1024 * 1024) { toast.error("Chọn tệp .xlsx, .xls hoặc .csv không quá 5 MB.", { id: "tutoring-result" }); return; }
    setReading(true);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", sheetRows: 502 });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error("Tệp không có trang tính.");
      const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: "", blankrows: false });
      const normalized = normalizeImportRows(data, value => XLSX.SSF.parse_date_code(value, { date1904: !!workbook.Workbook?.WBProps?.date1904 }));
      const valid = tutoringBatch.safeParse(normalized);
      if (!valid.success) throw new Error(`Dòng ${Number(valid.error.issues[0].path[0] ?? 0) + 2}: ${valid.error.issues[0].message}`);
      setRows(normalized);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Không đọc được tệp Excel.", { id: "tutoring-result" }); }
    finally { setReading(false); }
  }
  const booked = slots.filter(s => s.is_booked).length;
  return <section className="space-y-6 text-slate-900">
    <header className="flex flex-wrap items-center justify-between gap-4 pr-7">
      <div><p className="text-xs font-bold tracking-wider text-amber-600">QUẢN TRỊ LỊCH HẸN</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Cấu Hình Ca Dò Bài 1-1</h1>
        <p className="mt-1 text-sm text-slate-500">Mở ca kiểm tra kiến thức qua Zoom và quản lý danh sách học sinh đã đặt chỗ.</p></div>
      <div className="flex flex-wrap gap-2">
        <button className={buttonClass} disabled={busy} onClick={() => { setRows([]); setImportOpen(true); }}><Upload className="size-4" />Nhập Excel</button>
        <button className={primaryClass} disabled={busy} onClick={() => setCreateOpen(true)}><Plus className="size-4 text-amber-400" />Thêm ngày & khung giờ mới</button>
      </div>
    </header>
    <div className="flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-sm font-semibold">Tháng <input type="month" value={month} disabled={busy || loading} onChange={e => { if (/^\d{4}-(0[1-9]|1[0-2])$/.test(e.target.value)) setMonth(e.target.value); }} className={`${inputClass} w-auto`} /></label>
      <button className={buttonClass} disabled={schedule.isFetching || busy} onClick={() => void load()}>{schedule.isFetching ? "Đang tải…" : "Tải lại"}</button>
      <button className={cn(buttonClass, "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100")} disabled={busy || loading} onClick={() => {
        const form = new FormData();
        form.set("operation", "lock_month"); form.set("month", month);
        void mutate(form);
      }}><LockKeyhole className="size-4" />Khóa toàn bộ tháng</button></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
      ["TỔNG SỐ CA ĐÃ MỞ", slots.length, "text-slate-900"], ["ĐÃ CÓ HỌC SINH ĐẶT", booked, "text-emerald-700"], ["CA CÒN TRỐNG", slots.filter(s => !s.is_booked && s.is_active).length, "text-amber-600"],
      ["HỌC SINH CHƯA ĐĂNG KÝ", Math.max(0, (schedule.data?.unbookedCount ?? 0) - 2), "text-rose-600"],
    ].map(([label, value, color]) => <div key={label} className="rounded-[28px] border border-slate-200 bg-white px-5 py-5"><p className="text-xs font-bold text-slate-400">{label}</p><p className={`mt-2 text-3xl font-bold ${color}`}>{loading ? "—" : value}</p></div>)}</div>
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
      <h2 className="border-b border-slate-100 px-6 py-5 text-sm font-extrabold">DANH SÁCH CA KIỂM TRA</h2>
      {chosen.length > 0 && <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-6 py-3">
        <span className="mr-2 text-sm font-semibold text-slate-600">Đã chọn {chosen.length} ca</span>
        <button className={buttonClass} disabled={busy || !chosen.length} onClick={() => bulk("lock")}>Khóa đã chọn</button>
        <button className={buttonClass} disabled={busy || !chosen.some(slot => slot.is_booked)} onClick={() => bulk("release")}>Hủy đặt đã chọn</button>
        <button className={cn(buttonClass, "text-red-700 hover:bg-red-50")} disabled={busy || !chosen.some(slot => !slot.is_booked)} onClick={() => bulk("delete")}><Trash2 className="size-4" />Xóa ca trống đã chọn</button>
        {!!chosen.length && <button className={buttonClass} disabled={busy} onClick={() => setSelected(new Set())}>Bỏ chọn</button>}
        <span className="text-xs text-slate-500">Nhấn giữ và kéo qua các dòng để chọn nhiều ca (tối đa 500).</span>
      </div>}
      {loading ? <p role="status" className="flex items-center gap-2 p-8 text-slate-500"><Loader2 className="size-4 animate-spin" />Đang tải lịch…</p> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-400"><tr><th className="w-12 py-4 pl-6"><input type="checkbox" aria-label="Chọn tất cả ca trong tháng" disabled={busy || !slots.length} checked={!!slots.length && chosen.length === slots.length} ref={element => { if (element) element.indeterminate = chosen.length > 0 && chosen.length < slots.length; }} onChange={e => setSelected(e.target.checked ? new Set(slots.slice(0, 500).map(slot => slot.id)) : new Set())} className="size-4 accent-amber-500" /></th><th className="px-6 py-4">NGÀY & THỜI GIAN</th><th className="px-6 py-4">TRẠNG THÁI / HỌC SINH ĐẶT</th><th className="px-6 py-4 text-right">QUẢN TRỊ</th></tr></thead>
        <tbody>{slots.map((slot, index) => <tr key={slot.id} aria-selected={selected.has(slot.id)}
          onPointerDown={e => {
            if (busy || e.button !== 0 || e.pointerType !== "mouse" || (e.target as HTMLElement).closest("button,input,a,label")) return;
            e.preventDefault();
            drag.current = { anchor: index, base: new Set(selected), add: !selected.has(slot.id) };
            selectRange(index);
          }} onPointerEnter={e => {
            if (!busy && e.buttons === 1) selectRange(index); else drag.current = null;
          }}
          className={cn("select-none border-t border-slate-100", selected.has(slot.id) ? "bg-amber-50 ring-1 ring-inset ring-amber-200" : "even:bg-slate-50/70")}>
          <td className="py-5 pl-6"><input type="checkbox" aria-label={`Chọn ca ${slot.slot_date} ${slot.start_time.slice(0, 5)}`} checked={selected.has(slot.id)} disabled={busy} onChange={() => toggleSelected(slot.id)} className="size-4 accent-amber-500" /></td>
          <td className="px-6 py-5"><p className="font-bold capitalize">{dateLabel(slot.slot_date)}</p><p className="mt-1 font-mono text-xs font-bold text-amber-700">{slot.start_time.slice(0, 5)}{slot.end_time && ` - ${slot.end_time.slice(0, 5)}`}</p>{slot.note && <p className="mt-1 max-w-xs break-words text-xs text-slate-500">{slot.note}</p>}</td>
          <td className="px-6 py-5">{slot.is_booked ? <p className="flex items-center gap-2 font-bold"><UserRound className="size-4 shrink-0 text-slate-400" />{slot.student_name || "Học sinh"}{slot.student_code && ` (${slot.student_code})`}</p> : <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">Ca trống ({slot.is_active ? "Đang mở" : "Đã khóa"})</span>}{slot.is_booked && !slot.is_active && <p className="mt-1 text-xs text-amber-700">Ca đã khóa</p>}</td>
          <td className="px-6 py-5"><div className="flex justify-end gap-2">{slot.is_booked && <button disabled={busy} className={buttonClass} onClick={() => act("release", slot)}>Hủy đặt</button>}
            <button disabled={busy} className={buttonClass} onClick={() => act("toggle", slot)}>{slot.is_active ? "Khóa" : "Mở"}</button>
            <button aria-label="Xóa ca" title={slot.is_booked ? "Hủy đặt trước khi xóa ca" : "Xóa ca"} disabled={busy || slot.is_booked} className={`${buttonClass} px-2.5 text-slate-400`} onClick={() => act("delete", slot)}><Trash2 className="size-4" /></button>
          </div></td>
        </tr>)}</tbody>
      </table>{!slots.length && <p className="p-10 text-center text-slate-500">Chưa có ca kiểm tra trong tháng này.</p>}</div>}
    </div>
    <Dialog open={createOpen} onOpenChange={value => { if (!busy) setCreateOpen(value); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-[28px] p-0 sm:max-w-xl">
        <div className="flex gap-3 bg-slate-900 p-6 text-white"><CalendarPlus className="size-10 rounded-xl border border-amber-500/40 p-2 text-amber-400" /><div><DialogTitle className="text-lg font-extrabold">Thêm Ca Dò Bài Mới</DialogTitle><DialogDescription className="mt-1 text-slate-400">Tạo lịch trống để học sinh tự vào chọn</DialogDescription></div></div>
        <form action={form => void mutate(form)} className="space-y-5 p-6">
          <input name="operation" type="hidden" value="create" />
          <label className="grid gap-2 text-sm font-bold text-slate-600">Chọn ngày dò bài <input name="slot_date" type="date" required defaultValue={`${month}-01`} className={inputClass} /></label>
          <div><p className="mb-2 text-sm font-bold text-slate-600">Chọn khung giờ mẫu nhanh</p><div className="grid grid-cols-2 gap-2">{[["20:00", "20:30"], ["20:30", "21:00"], ["21:00", "21:30"], ["21:30", "22:00"]].map(([a, b]) => <button type="button" key={a} aria-pressed={start === a && end === b} onClick={() => { setStart(a); setEnd(b); }} className={cn(buttonClass, "font-mono", start === a && end === b && "border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100")}>{a} - {b}</button>)}</div></div>
          <div className="grid grid-cols-2 gap-3"><label className="grid gap-2 text-sm font-bold text-slate-600">Giờ bắt đầu<input name="start_time" type="time" required value={start} onChange={e => setStart(e.target.value)} className={inputClass} /></label><label className="grid gap-2 text-sm font-bold text-slate-600">Giờ kết thúc<input name="end_time" type="time" value={end} onChange={e => setEnd(e.target.value)} className={inputClass} /></label></div>
          <label className="grid gap-2 text-sm font-bold text-slate-600">Ghi chú (tùy chọn)<input name="note" maxLength={2000} className={inputClass} /></label>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-5"><button type="button" disabled={busy} className={buttonClass} onClick={() => setCreateOpen(false)}>Hủy</button><button disabled={busy} className={primaryClass}><Plus className="size-4 text-amber-400" />{busy ? "Đang tạo…" : "Thêm ca ngay"}</button></div>
        </form>
      </DialogContent>
    </Dialog>
    <Dialog open={importOpen} onOpenChange={value => { if (!busy && !reading) setImportOpen(value); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-[28px] sm:max-w-2xl">
        <DialogTitle className="text-xl font-bold">Nhập ca dò bài từ Excel</DialogTitle>
        <DialogDescription>Đọc trang tính đầu tiên, tối đa 500 ca. Kiểm tra dữ liệu trước khi tạo hàng loạt.</DialogDescription>
        <p className="text-sm text-slate-600">Cột bắt buộc: <b>slot_date</b> (YYYY-MM-DD hoặc DD/MM/YYYY), <b>start_time</b> (HH:mm). Cột tùy chọn: <b>end_time</b>, <b>note</b>. Hỗ trợ ô ngày và giờ của Excel.</p>
        <button type="button" disabled={downloadingTemplate} onClick={() => void downloadTemplate()} className={`${buttonClass} w-fit`}><Download className="size-4" />{downloadingTemplate ? "Đang tạo mẫu…" : "Tải mẫu Excel (.xlsx)"}</button>
        <input type="file" accept=".xlsx,.xls,.csv" aria-label="Chọn tệp Excel" disabled={reading || busy} onChange={e => void readFile(e.target.files?.[0])} className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2`} />
        {reading && <p role="status">Đang đọc tệp…</p>}
        {!!rows.length && <><p className="font-semibold text-emerald-700">{rows.length} ca hợp lệ, sẵn sàng nhập.</p><div className="max-h-52 overflow-auto rounded-xl border"><table className="w-full text-left text-xs"><thead><tr>{["Ngày", "Bắt đầu", "Kết thúc", "Ghi chú"].map(h => <th className="p-2" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr className="border-t" key={i}><td className="p-2">{r.slot_date}</td><td className="p-2">{r.start_time}</td><td className="p-2">{r.end_time}</td><td className="max-w-48 break-words p-2">{r.note}</td></tr>)}</tbody></table></div></>}
        <p className="text-xs text-slate-500">Nếu có ca trùng lịch hiện có, toàn bộ lần nhập sẽ dừng, không ghi đè ca hoặc thông tin học sinh.</p>
        <div className="flex justify-end gap-2"><button disabled={busy || reading} className={buttonClass} onClick={() => setImportOpen(false)}>Hủy</button><button disabled={busy || reading || !rows.length} className={primaryClass} onClick={() => { const form = new FormData(); form.set("operation", "import"); form.set("rows", JSON.stringify(rows)); void mutate(form); }}>{busy ? "Đang nhập…" : `Tạo ${rows.length} ca`}</button></div>
      </DialogContent>
    </Dialog>
  </section>;
}
