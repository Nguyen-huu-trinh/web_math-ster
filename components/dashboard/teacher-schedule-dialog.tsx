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
  X,
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

const NOTE_OPTIONS = ["Bài giảng", "Chữa bài", "Chữa đề"] as const;

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
    start_time: "21:00",
    note: "Bài giảng",
    reminder: "",
    is_active: true,
  };
}

function getNoteBadgeStyle(note: string) {
  switch (note) {
    case "Bài giảng":
      return {
        badge: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400"
      };
    case "Chữa bài":
      return {
        badge: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
        icon: "text-purple-600 dark:text-purple-400"
      };
    case "Chữa đề":
      return {
        badge: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
        icon: "text-emerald-600 dark:text-emerald-400"
      };
    default:
      return {
        badge: "bg-muted text-muted-foreground border-border",
        icon: "text-muted-foreground"
      };
  }
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

    const validNote = NOTE_OPTIONS.includes(schedule.note as any)
      ? schedule.note!
      : NOTE_OPTIONS[0];

    setForm({
      session_date: schedule.session_date,
      content: schedule.content,
      start_time: formatTime(schedule.start_time),
      note: validNote,
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
            note: form.note || NOTE_OPTIONS[0],
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
          note: form.note || NOTE_OPTIONS[0],
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

  function getNoteBadgeStyle(note: string) {
  switch (note) {
    case "Bài giảng":
      // Xanh dương: Thanh lịch, tập trung
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50";
    case "Chữa bài":
      // Tím: Nổi bật, phân biệt với bài giảng
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/50";
    case "Chữa đề":
      // Xanh lá / Emerald: Cảm giác hoàn thành, luyện tập
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-[92vw] p-0 gap-0 overflow-hidden max-h-[88vh] flex flex-col shadow-2xl rounded-2xl border">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b bg-background">
          <DialogTitle className="text-xl font-bold tracking-tight">
            Thời khóa biểu
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Nhấn trực tiếp vào dòng để chỉnh sửa hoặc nhấn dấu "+" để thêm lịch mới.
          </p>
        </DialogHeader>

        {/* Week controls */}
        <div className="flex items-center justify-between border-b px-6 py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">
              {formatDisplayDate(week.startDate)} - {formatDisplayDate(week.endDate)}
            </p>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full border">
              Thứ 2 → Chủ nhật
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-lg border bg-background p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setWeekType("current")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                weekType === "current"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Tuần hiện tại
            </button>
            <button
              type="button"
              onClick={() => setWeekType("next")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                weekType === "next"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Tuần sau
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {scheduleQuery.isLoading && (
            <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground bg-background">
              Đang tải thời khóa biểu...
            </div>
          )}

          {scheduleQuery.isError && (
            <div className="rounded-xl border border-dashed py-16 text-center text-sm text-destructive bg-background">
              Không thể tải thời khóa biểu.
            </div>
          )}

          {!scheduleQuery.isLoading && !scheduleQuery.isError && (
            <div className="overflow-x-auto rounded-xl border bg-background shadow-sm">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground">
                    <th className="w-[140px] px-4 py-3.5 text-xs font-semibold uppercase tracking-wider">
                      Thứ / Ngày
                    </th>
                    <th className="w-[120px] px-4 py-3.5 text-xs font-semibold uppercase tracking-wider">
                      Giờ vào lớp
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider">
                      Nội dung
                    </th>
                    <th className="w-[150px] px-4 py-3.5 text-xs font-semibold uppercase tracking-wider">
                      Ghi chú
                    </th>
                    <th className="w-[180px] px-4 py-3.5 text-xs font-semibold uppercase tracking-wider">
                      Lưu ý
                    </th>
                    <th className="w-[90px] px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {DAYS.map((day) => {
                    const date = getDateForDay(week.monday, day.key);
                    const items = schedulesByDate.get(date) ?? [];

                    if (items.length === 0) {
                      const isCreating =
                        editingId === null && form?.session_date === date;

                      if (isCreating && form) {
                        return (
                          <tr key={date} className="bg-primary/5 transition-colors">
                            {/* Thứ / Ngày */}
                            <td className="px-4 py-3.5 align-top">
                              <div className="flex items-start gap-2">
                                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <div>
                                  <div className="font-semibold text-foreground">
                                    {day.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDisplayDate(date)}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Giờ */}
                            <td className="px-4 py-3.5 align-top">
                              <input
                                type="time"
                                value={form.start_time}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    start_time: e.target.value,
                                  })
                                }
                                className="h-8 w-full rounded-lg border bg-background px-2 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/30"
                              />
                            </td>

                            {/* Nội dung */}
                            <td className="px-4 py-3.5 align-top">
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
                                className="h-8 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/30"
                              />
                            </td>

                            {/* Ghi chú */}
                            <td className="px-4 py-3.5 align-top">
<select
  value={form.note}
  onChange={(e) =>
    setForm({
      ...form,
      note: e.target.value,
    })
  }
  className={`h-8 w-full rounded-lg border px-2 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/30 ${getNoteBadgeStyle(
    form.note
  )}`}
>
  {NOTE_OPTIONS.map((option) => (
    <option key={option} value={option} className="bg-background text-foreground">
      {option}
    </option>
  ))}
</select>
                            </td>

                            {/* Lưu ý */}
                            <td className="px-4 py-3.5 align-top">
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
                                className="h-8 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/30"
                              />
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 align-top text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={handleSave}
                                  disabled={
                                    createMutation.isPending ||
                                    updateMutation.isPending
                                  }
                                  className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-500/10 transition disabled:opacity-50"
                                  title="Lưu"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={closeEditor}
                                  disabled={
                                    createMutation.isPending ||
                                    updateMutation.isPending
                                  }
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition disabled:opacity-50"
                                  title="Hủy"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr
                          key={date}
                          className="group transition-colors hover:bg-muted/30"
                        >
                          <td className="px-4 py-3.5 align-top">
                            <div className="flex items-start gap-2">
                              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                              <div>
                                <div className="font-semibold text-foreground">
                                  {day.label}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDisplayDate(date)}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td colSpan={5} className="p-0">
                            <button
                              type="button"
                              onClick={() => startCreate(date)}
                              className="flex h-full min-h-[52px] w-full items-center justify-center gap-1.5 px-4 text-xs font-medium text-muted-foreground/70 transition-all hover:bg-primary/5 hover:text-primary"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Thêm lịch học
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
                            isEditing
                              ? "bg-primary/5"
                              : "hover:bg-muted/30"
                          }`}
                        >
                          <td className="px-4 py-3.5 align-top">
                            {index === 0 ? (
                              <div className="flex items-start gap-2">
                                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                <div>
                                  <div className="font-semibold text-foreground">
                                    {day.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDisplayDate(date)}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs font-normal text-muted-foreground/60 italic pl-6">
                                Cùng ngày
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 align-top">
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
                                className="h-8 w-full rounded-lg border bg-background px-2 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/30"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20"
                              >
                                <Clock className="h-3.5 w-3.5" />
                                {formatTime(item.start_time)}
                              </button>
                            )}
                          </td>

                          <td className="px-4 py-3.5 align-top">
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
                                className="h-8 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/30"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="w-full text-left font-medium text-foreground transition hover:text-primary"
                              >
                                {item.content}
                              </button>
                            )}
                          </td>

                          {/* Ghi chú - Form chỉnh sửa / Badge */}
                          <td className="px-4 py-3.5 align-top">
                            {isEditing && form ? (
                              <select
                                value={form.note}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    note: e.target.value,
                                  })
                                }
                                className="h-8 w-full rounded-lg border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/30"
                              >
                                {NOTE_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="flex w-full items-start text-left"
                              >
{item.note ? (
  <span
    className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-medium ${getNoteBadgeStyle(
      item.note
    )}`}
  >
    <FileText className="h-3 w-3" />
    {item.note}
  </span>
) : (
  <span className="text-xs text-muted-foreground/40 hover:text-muted-foreground">
    + Chọn ghi chú
  </span>
)}
                              </button>
                            )}
                          </td>

                          <td className="px-4 py-3.5 align-top">
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
                                className="h-8 w-full rounded-lg border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-primary/30"
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
                                    <span className="line-clamp-2">{item.reminder}</span>
                                  </>
                                ) : (
                                  <span className="font-normal text-muted-foreground/40 hover:text-muted-foreground">
                                    + Lưu ý
                                  </span>
                                )}
                              </button>
                            )}
                          </td>

                          <td className="px-4 py-3.5 align-top text-right">
                            {isEditing && form ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={handleSave}
                                  disabled={
                                    createMutation.isPending ||
                                    updateMutation.isPending
                                  }
                                  className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-500/10 transition"
                                  title="Lưu"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={closeEditor}
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition"
                                  title="Hủy"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => startEdit(item)}
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                                  title="Sửa"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                  disabled={deleteMutation.isPending}
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                                  title="Xóa"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
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
        <div className="flex items-center justify-between border-t bg-background px-6 py-3.5">
          <p className="text-xs text-muted-foreground">
            Lịch đang ở trạng thái hiển thị sẽ được học sinh nhìn thấy.
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border px-4 py-2 text-xs font-semibold hover:bg-muted transition"
          >
            Đóng
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}