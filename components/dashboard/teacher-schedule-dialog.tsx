


"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  FileText,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateTeacherSchedule,
  useDeleteTeacherSchedule,
  useTeacherSchedule,
  useUpdateTeacherSchedule,
} from "@/hooks/use-teacher-schedule";

type WeekType = "current" | "next";

interface TeacherScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ScheduleForm {
  session_date: string;
  content: string;
  start_time: string;
  note: string;
  reminder: string;
  is_active: boolean;
}

const DAYS = [
  { key: 1, label: "Thứ 2" },
  { key: 2, label: "Thứ 3" },
  { key: 3, label: "Thứ 4" },
  { key: 4, label: "Thứ 5" },
  { key: 5, label: "Thứ 6" },
  { key: 6, label: "Thứ 7" },
  { key: 0, label: "Chủ nhật" },
];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonday(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

function getWeekRange(weekType: WeekType) {
  const monday = getMonday(new Date());

  if (weekType === "next") {
    monday.setDate(monday.getDate() + 7);
  }

  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  return {
    startDate: formatDate(monday),
    endDate: formatDate(sunday),
    monday,
    sunday,
  };
}

function formatDisplayDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatTime(time: string) {
  return time ? time.slice(0, 5) : "";
}

function getDateForDay(monday: Date, dayKey: number) {
  const date = new Date(monday);
  const offset = dayKey === 0 ? 6 : dayKey - 1;
  date.setDate(date.getDate() + offset);
  return formatDate(date);
}

function createEmptyForm(sessionDate: string): ScheduleForm {
  return {
    session_date: sessionDate,
    content: "",
    start_time: "08:00",
    note: "",
    reminder: "",
    is_active: true,
  };
}

export function TeacherScheduleDialog({
  open,
  onOpenChange,
}: TeacherScheduleDialogProps) {
  const [weekType, setWeekType] = useState<WeekType>("current");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ScheduleForm | null>(null);

  const week = useMemo(() => getWeekRange(weekType), [weekType]);

  const scheduleQuery = useTeacherSchedule(week.startDate, week.endDate);
  const createMutation = useCreateTeacherSchedule();
  const updateMutation = useUpdateTeacherSchedule();
  const deleteMutation = useDeleteTeacherSchedule();

  const schedules = scheduleQuery.data ?? [];

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, typeof schedules>();

    for (const item of schedules) {
      const existing = map.get(item.session_date) ?? [];
      existing.push(item);
      map.set(item.session_date, existing);
    }

    for (const items of map.values()) {
      items.sort((a, b) => a.start_time.localeCompare(b.start_time));
    }

    return map;
  }, [schedules]);

  function startCreate(sessionDate: string) {
    setEditingId(null);
    setForm(createEmptyForm(sessionDate));
  }

  function startEdit(schedule: (typeof schedules)[number]) {
    setEditingId(schedule.id);
    setForm({
      session_date: schedule.session_date,
      content: schedule.content,
      start_time: formatTime(schedule.start_time),
      note: schedule.note ?? "",
      reminder: schedule.reminder ?? "",
      is_active: schedule.is_active,
    });
  }

  function closeEditor() {
    setEditingId(null);
    setForm(null);
  }

  async function handleSave() {
    if (!form) return;

    if (!form.content.trim()) {
      toast.error("Vui lòng nhập nội dung buổi học.");
      return;
    }

    if (!form.session_date) {
      toast.error("Vui lòng chọn ngày học.");
      return;
    }

    if (!form.start_time) {
      toast.error("Vui lòng nhập giờ vào lớp.");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          input: {
            session_date: form.session_date,
            content: form.content.trim(),
            start_time: form.start_time,
            note: form.note.trim() || null,
            reminder: form.reminder.trim() || null,
            is_active: form.is_active,
          },
        });
        toast.success("Đã cập nhật lịch học.");
      } else {
        await createMutation.mutateAsync({
          session_date: form.session_date,
          content: form.content.trim(),
          start_time: form.start_time,
          note: form.note.trim() || null,
          reminder: form.reminder.trim() || null,
          is_active: form.is_active,
        });
        toast.success("Đã thêm lịch học.");
      }
      closeEditor();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu lịch học."
      );
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Bạn có chắc muốn xóa lịch học này không?");
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
      if (editingId === id) {
        closeEditor();
      }
      toast.success("Đã xóa lịch học.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa lịch học."
      );
    }
  }

  async function handleToggleActive(schedule: (typeof schedules)[number]) {
    try {
      await updateMutation.mutateAsync({
        id: schedule.id,
        input: {
          is_active: !schedule.is_active,
        },
      });
      toast.success(
        schedule.is_active ? "Đã ẩn lịch học." : "Đã bật lịch học."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái."
      );
    }
  }

  return (
<Dialog open={open} onOpenChange={onOpenChange}>
  {/* 📍 SỬA DÒNG NÀY: Thêm sm:max-w-5xl và w-[90vw] */}
  <DialogContent className="sm:max-w-5xl w-[90vw] p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
    {/* Header */}
    <DialogHeader className="p-6 pb-4 border-b">
      <DialogTitle className="text-xl font-semibold">
        Thời khóa biểu
      </DialogTitle>
      <p className="text-sm text-muted-foreground mt-1">
        Nhấn trực tiếp vào ô để thêm hoặc chỉnh sửa lịch học.
      </p>
    </DialogHeader>

        {/* Week controls */}
        <div className="flex items-center justify-between border-b px-6 py-3 bg-muted/10">
          <div>
            <p className="text-sm font-medium">
              {formatDisplayDate(week.startDate)} -{" "}
              {formatDisplayDate(week.endDate)}
            </p>
            <p className="text-xs text-muted-foreground">Thứ 2 → Chủ nhật</p>
          </div>

          <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
            <button
              type="button"
              onClick={() => setWeekType("current")}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                weekType === "current"
                  ? "bg-primary font-medium text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Tuần hiện tại
            </button>
            <button
              type="button"
              onClick={() => setWeekType("next")}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                weekType === "next"
                  ? "bg-primary font-medium text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              Tuần sau
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {scheduleQuery.isLoading && (
            <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
              Đang tải thời khóa biểu...
            </div>
          )}

          {scheduleQuery.isError && (
            <div className="rounded-lg border border-dashed py-12 text-center text-sm text-destructive">
              Không thể tải thời khóa biểu.
            </div>
          )}

          {!scheduleQuery.isLoading && !scheduleQuery.isError && (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
 <thead>
  <tr className="border-b bg-muted/50">
    {/* 📍 Sửa w-[150px] -> w-[130px] */}
    <th className="w-[130px] whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
      Thứ / Ngày
    </th>
    {/* 📍 Sửa w-[130px] -> w-[110px] */}
    <th className="w-[110px] whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
      Giờ vào lớp
    </th>
    {/* 📍 Tăng tỉ lệ rộng cho Nội dung bằng w-[35%] */}
    <th className="w-[55%] px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
      Nội dung
    </th>
    {/* 📍 Tăng tỉ lệ rộng cho Ghi chú bằng w-[25%] */}
    <th className="w-[15%] px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
      Ghi chú
    </th>
    {/* 📍 Tăng tỉ lệ rộng cho Lưu ý bằng w-[25%] */}
    <th className="w-[15%] px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
      Lưu ý
    </th>
    {/* 📍 Ô hành động (Sửa/Xóa) */}
    <th className="w-[80px] px-4 py-3" />
  </tr>
</thead>

                <tbody className="divide-y">
                  {DAYS.map((day) => {
                    const date = getDateForDay(week.monday, day.key);
                    const items = schedulesByDate.get(date) ?? [];

                    if (items.length === 0) {
                      return (
                        <tr
                          key={date}
                          className="group transition-colors hover:bg-muted/20"
                        >
                          <td className="px-4 py-4 align-top">
                            <div className="flex items-start gap-2">
                              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                              <div>
                                <div className="font-semibold">{day.label}</div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                  {formatDisplayDate(date)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td colSpan={6} className="p-0">
                            <button
                              type="button"
                              onClick={() => startCreate(date)}
                              className="flex min-h-[64px] w-full items-center justify-center gap-2 px-4 text-sm text-muted-foreground transition hover:bg-primary/5 hover:text-primary"
                            >
                              <Plus className="h-4 w-4" />
                              Nhấn vào đây để thêm lịch
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    return items.map((item, index) => {
                      const isEditing = editingId === item.id;

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            isEditing ? "bg-primary/5" : "hover:bg-muted/20"
                          }`}
                        >
                          <td className="px-4 py-4 align-top">
                            {index === 0 ? (
                              <div className="flex items-start gap-2">
                                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                <div>
                                  <div className="font-semibold">
                                    {day.label}
                                  </div>
                                  <div className="mt-0.5 text-xs text-muted-foreground">
                                    {formatDisplayDate(date)}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Cùng ngày
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 align-top">
                            {isEditing && form ? (
                              <input
                                type="time"
                                value={form.start_time}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    start_time: e.target.value,
                                  })
                                }
                                className="h-9 w-full rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1.5 font-semibold text-primary transition hover:bg-primary/20"
                              >
                                <Clock className="h-3.5 w-3.5" />
                                {formatTime(item.start_time)}
                              </button>
                            )}
                          </td>

                          <td className="px-4 py-4 align-top">
                            {isEditing && form ? (
                              <input
                                type="text"
                                autoFocus
                                value={form.content}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    content: e.target.value,
                                  })
                                }
                                placeholder="Nội dung bài học..."
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="w-full text-left font-medium hover:text-primary"
                              >
                                {item.content}
                              </button>
                            )}
                          </td>

                          <td className="px-4 py-4 align-top">
                            {isEditing && form ? (
                              <input
                                type="text"
                                value={form.note}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    note: e.target.value,
                                  })
                                }
                                placeholder="Ghi chú..."
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="flex w-full items-start gap-1.5 text-left text-xs text-muted-foreground"
                              >
                                {item.note ? (
                                  <>
                                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                    <span>{item.note}</span>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground/40">
                                    + Ghi chú
                                  </span>
                                )}
                              </button>
                            )}
                          </td>

                          <td className="px-4 py-4 align-top">
                            {isEditing && form ? (
                              <input
                                type="text"
                                value={form.reminder}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    reminder: e.target.value,
                                  })
                                }
                                placeholder="Lưu ý..."
                                className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="flex w-full items-start gap-1.5 text-left text-xs font-medium text-amber-600 dark:text-amber-500"
                              >
                                {item.reminder ? (
                                  <>
                                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                    <span>{item.reminder}</span>
                                  </>
                                ) : (
                                  <span className="font-normal text-muted-foreground/40">
                                    + Lưu ý
                                  </span>
                                )}
                              </button>
                            )}
                          </td>

                          {/* <td className="px-4 py-4 align-top">
                            {isEditing && form ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setForm({
                                    ...form,
                                    is_active: !form.is_active,
                                  })
                                }
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                  form.is_active
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {form.is_active && <Check className="h-3 w-3" />}
                                {form.is_active ? "Hiển thị" : "Ẩn"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleActive(item)}
                                disabled={updateMutation.isPending}
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                  item.is_active
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {item.is_active ? "Hiển thị" : "Ẩn"}
                              </button>
                            )}
                          </td> */}

                          <td className="px-4 py-4 align-top">
                            {isEditing && form ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={handleSave}
                                  disabled={
                                    createMutation.isPending ||
                                    updateMutation.isPending
                                  }
                                  className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-500/10"
                                  title="Lưu"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={closeEditor}
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                                  title="Hủy"
                                >
                                  <Trash2 className="h-4 w-4 hidden" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => startEdit(item)}
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                  title="Sửa"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                  disabled={deleteMutation.isPending}
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  title="Xóa"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-3">
          <p className="text-xs text-muted-foreground">
            Lịch đang ở trạng thái hiển thị sẽ được học sinh nhìn thấy.
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition"
          >
            Đóng
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}