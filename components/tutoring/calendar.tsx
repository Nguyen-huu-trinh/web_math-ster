"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { mutateTutoringSlot } from "@/app/actions/tutoring";
import type { TutoringSlot } from "@/types/tutoring";
import { ArrowRight, Clock3, Video } from "lucide-react";
import { toast } from "sonner";

const field = "rounded-md border bg-background px-3 py-2 text-sm";
const button = "rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed";

export function TutoringCalendar({ slots, month, teacher, userId, onMonthChange, onUpdated }: {
  slots: TutoringSlot[]; month: string; teacher: boolean; userId: string;
  onMonthChange?: (month: string) => void;
  onUpdated?: () => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const mine = slots.find(s => s.student_id === userId);
  function submit(form: FormData) {
    startTransition(async () => {
      try {
        const result = await mutateTutoringSlot(form);
        if (result.ok) toast.success(form.get("operation") === "delete" ? "Đã xóa" : "Đã cập nhật", { id: "tutoring-result" });
        else toast.error(result.message, { id: "tutoring-result" });
        if (onUpdated) await onUpdated();
        else router.refresh();
      } catch {
        toast.error("Không thể cập nhật lịch. Vui lòng thử lại.", { id: "tutoring-result" });
      }
    });
  }
  function act(operation: string, slot: TutoringSlot) {
    const form = new FormData();
    form.set("operation", operation); form.set("id", slot.id);
    form.set("active", String(!slot.is_active));
    submit(form);
  }
  if (!teacher) {
    const visibleSlots = slots.filter(slot =>
      Date.parse(`${slot.slot_date}T${slot.start_time}+07:00`) > now &&
      (slot.student_id === userId || (!slot.is_booked && slot.is_active))
    );
    return <section className="space-y-5 text-slate-900">
      <header className="rounded-[28px] border border-slate-200 bg-white px-5 py-6 sm:px-7">
        <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-amber-600"><Video className="size-4 shrink-0" />DÒ BÀI ĐỊNH KỲ QUA ZOOM (1 KÈM 1)</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Chọn Lịch Dò Bài Của Bạn</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">Mỗi khung giờ chỉ dành riêng cho <strong>1 học sinh</strong>. Các ca đã có bạn đặt sẽ tự động ẩn khỏi danh sách.</p>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">Tháng
          <input type="month" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900" value={month} disabled={pending} onChange={e => {
            if (/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(e.target.value)) {
              if (onMonthChange) onMonthChange(e.target.value);
              else router.push(`/tutoring?month=${e.target.value}`);
            }
          }} />
        </label>
      </div>
      {pending && <p role="status" className="text-sm text-slate-500">Đang cập nhật…</p>}
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-50 text-sm font-extrabold text-slate-600"><tr>
            <th scope="col" className="px-5 py-4 sm:px-7">NGÀY DÒ BÀI</th>
            <th scope="col" className="px-5 py-4 sm:px-7">KHUNG GIỜ (ZOOM)</th>
            <th scope="col" className="px-5 py-4 sm:px-7">CÒN LẠI</th>
            <th scope="col" className="px-5 py-4 text-right sm:px-7">THAO TÁC</th>
          </tr></thead>
          <tbody>{visibleSlots.map(slot => {
            const own = slot.student_id === userId;
            const remaining = Math.max(1, Math.ceil((Date.parse(`${slot.slot_date}T${slot.start_time}+07:00`) - now) / 60000));
            const days = Math.floor(remaining / 1440);
            const countdown = days >= 1 ? `${days} ngày` : remaining < 60 ? "Dưới 1 giờ" : `${Math.floor(remaining / 60)} giờ`;
            const past = Date.parse(`${slot.slot_date}T${slot.start_time}+07:00`) <= Date.now();
            const label = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(`${slot.slot_date}T12:00:00+07:00`));
            return <tr key={slot.id} className="border-t border-slate-100 even:bg-slate-50/60">
              <td className="px-5 py-5 sm:px-7"><p className="text-base font-extrabold capitalize text-slate-900">{label}</p>{own && <span className="mt-1 inline-block rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">Ca của bạn</span>}{slot.note && <p className="mt-1 max-w-xs whitespace-pre-wrap break-words text-xs text-slate-500">{slot.note}</p>}</td>
              <td className="px-5 py-5 sm:px-7"><span className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 font-mono text-sm font-extrabold text-slate-900"><Clock3 className="size-4 text-amber-500" />{slot.start_time.slice(0, 5)}{slot.end_time && ` - ${slot.end_time.slice(0, 5)}`}</span></td>
              <td className="px-5 py-5 sm:px-7"><span className="whitespace-nowrap text-base font-extrabold tabular-nums text-amber-700">{countdown}</span></td>
              <td className="px-5 py-5 text-right sm:px-7">{own ? <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={pending || past} onClick={() => act("cancel", slot)}>Hủy đăng ký</button>
                : <button className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={pending || past || !!mine} onClick={() => act("book", slot)}>{past ? "Đã qua giờ" : "Chọn ca này"}<ArrowRight className="size-4 text-amber-400" /></button>}</td>
            </tr>;
          })}</tbody>
        </table></div>
        {!visibleSlots.length && <p className="px-5 py-10 text-center text-sm text-slate-500">Không có ca dò bài còn hạn trong tháng này.</p>}
      </div>
    </section>;
  }
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-bold">Đăng ký thời gian dò bài</h1>
        <p className="mt-2 text-sm text-muted-foreground">Mỗi học sinh được đăng ký tối đa một ca mỗi tháng. Giờ Việt Nam (UTC+7).</p></div>
      <label className="grid gap-1 text-sm">Tháng
        <input type="month" className={field} value={month} disabled={pending} onChange={e => {
          if (/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(e.target.value)) {
            if (onMonthChange) onMonthChange(e.target.value);
            else router.push(`/tutoring?month=${e.target.value}`);
          }
        }} />
      </label>
    </div>
    {!teacher && mine && <p className="rounded-lg bg-primary/10 p-4">Bạn đã đăng ký ngày {mine.slot_date.split("-").reverse().join("/")} lúc {mine.start_time.slice(0, 5)}{!mine.is_active && " (ca đang bị khóa)"}.</p>}
    {teacher && <form action={submit} className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
      <h2 className="font-semibold sm:col-span-2 lg:col-span-4">Tạo ca dò bài</h2>
      <input type="hidden" name="operation" value="create" />
      <label className="grid gap-1 text-sm">Ngày<input className={field} type="date" name="slot_date" required /></label>
      <label className="grid gap-1 text-sm">Bắt đầu<input className={field} type="time" name="start_time" required /></label>
      <label className="grid gap-1 text-sm">Kết thúc (tùy chọn)<input className={field} type="time" name="end_time" /></label>
      <label className="grid gap-1 text-sm">Ghi chú<input className={field} name="note" maxLength={2000} /></label>
      <button className={`${button} bg-primary text-primary-foreground`} disabled={pending}>Tạo ca</button>
    </form>}
    {pending && <p role="status" className="text-sm text-muted-foreground">Đang cập nhật…</p>}
    {!slots.length ? <p className="rounded-xl border p-8 text-center text-muted-foreground">Chưa có ca dò bài trong tháng này.</p> :
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{slots.map(slot => {
        const own = slot.student_id === userId;
        const past = Date.parse(`${slot.slot_date}T${slot.start_time}+07:00`) <= Date.now();
        return <article key={slot.id} className="space-y-3 rounded-xl border bg-card p-5">
          <h2 className="font-semibold">{slot.slot_date.split("-").reverse().join("/")}</h2>
          <p className="text-xl font-medium">{slot.start_time.slice(0, 5)}{slot.end_time && ` – ${slot.end_time.slice(0, 5)}`}</p>
          <p className="text-sm">{!slot.is_active ? "Đã khóa" : past ? "Đã qua giờ bắt đầu" : slot.is_booked ? "Đã đăng ký" : "Còn trống"}{own && " · Ca của bạn"}</p>
          {teacher && slot.is_booked && <p className="break-words text-sm">Học sinh: {slot.student_name || slot.student_id}</p>}
          {slot.note && <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{slot.note}</p>}
          <div className="flex flex-wrap gap-2">{teacher ? <>
            <button className={button} disabled={pending} onClick={() => act("toggle", slot)}>{slot.is_active ? "Khóa ca" : "Mở ca"}</button>
            <button className={button} disabled={pending || slot.is_booked} onClick={() => {
              act("delete", slot);
            }}>Xóa ca</button>
          </> : own ? <button className={button} disabled={pending || past} onClick={() => act("cancel", slot)}>Hủy đăng ký</button>
            : <button className={`${button} bg-primary text-primary-foreground`} disabled={pending || past || slot.is_booked || !slot.is_active || !!mine} onClick={() => act("book", slot)}>Đăng ký</button>}
          </div>
        </article>;
      })}</div>}
  </div>;
}
