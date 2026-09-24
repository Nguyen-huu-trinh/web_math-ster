"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import {
  StudentRule,
  studentRulesClientService,
} from "@/services/student-rules-client.service";

import RuleEditor from "@/components/student-rules/rule-editor";
import { useAuth } from "@/providers/auth-provider";

/* =========================================================================
 * BỘ PARSER TỰ ĐỘNG PHÂN TÍCH TEXT THUẦN THÀNH GIAO DIỆN THÔNG MINH
 * ========================================================================= */
function parseInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|\+\d+\s*(?:máu|điểm)?|-\d+\s*(?:máu|điểm)?|kick\s+khỏi\s+lớp)/gi);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2);
      const isNegative =
        content.includes("-") || content.toLowerCase().includes("kick");
      const isPositive = content.includes("+");

      if (isNegative) {
        return (
          <span
            key={index}
            className="mx-0.5 inline-flex items-center rounded-md bg-rose-100 px-1.5 py-0.2 text-xs font-black text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
          >
            {content}
          </span>
        );
      }
      if (isPositive) {
        return (
          <span
            key={index}
            className="mx-0.5 inline-flex items-center rounded-md bg-emerald-100 px-1.5 py-0.2 text-xs font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            {content}
          </span>
        );
      }
      return (
        <strong key={index} className="font-black text-slate-900 dark:text-white">
          {content}
        </strong>
      );
    }

    if (/^\+\d+\s*(?:máu|điểm)?$/i.test(part.trim())) {
      return (
        <span
          key={index}
          className="mx-1 inline-flex items-center rounded-md border border-emerald-200 bg-emerald-100/90 px-2 py-0.5 font-mono text-xs font-black text-emerald-700 shadow-2xs"
        >
          {part.trim()}
        </span>
      );
    }

    if (/^-\d+\s*(?:máu|điểm)?$/i.test(part.trim())) {
      return (
        <span
          key={index}
          className="mx-1 inline-flex items-center rounded-md border border-rose-200 bg-rose-100/90 px-2 py-0.5 font-mono text-xs font-black text-rose-600 shadow-2xs"
        >
          {part.trim()}
        </span>
      );
    }

    if (/kick\s+khỏi\s+lớp/i.test(part)) {
      return (
        <span key={index} className="font-black text-rose-600 underline underline-offset-2">
          {part}
        </span>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function FormattedRuleContent({ rawContent }: { rawContent: string }) {
  const cleanLines = useMemo(() => {
    if (!rawContent) return [];

    let text = rawContent
      .replace(/<\/p>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n- ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, "");

    text = text.replace(/[\u2013\u2014\u2012\u2212]/g, "-");
    text = text.replace(/([^\n])\s*-\s+([A-Z0-9À-Ỹ])/gu, "$1\n- $2");
    text = text.replace(/([^\n])\s*(Đặc biệt:|Cảnh báo:|\[canhbao\])/gi, "$1\n$2");

    const rawLines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const result: string[] = [];
    rawLines.forEach((line) => {
      const subItems = line.split(/(?=\s+-\s+[A-Z0-9À-Ỹ])/gu);
      subItems.forEach((sub) => {
        const trimmed = sub.trim();
        if (trimmed) result.push(trimmed);
      });
    });

    return result;
  }, [rawContent]);

  return (
    <div className="space-y-3 pt-1">
      {cleanLines.map((line, idx) => {
        const lower = line.toLowerCase();
        const isWarning =
          lower.startsWith("đặc biệt:") ||
          lower.startsWith("cảnh báo:") ||
          lower.startsWith("[canhbao]") ||
          lower.startsWith("! cảnh báo");

        if (isWarning) {
          const warningText = line
            .replace(/^(\[canhbao\]|!\s*cảnh báo:?|đặc biệt:?|cảnh báo:?)/i, "")
            .trim();

          return (
            <div
              key={idx}
              className="mt-3.5 flex items-start gap-3 rounded-2xl border border-rose-200/80 bg-gradient-to-r from-rose-50/50 to-rose-100/60 p-4 shadow-2xs transition-all"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <AlertTriangle className="size-4.5 stroke-[2.5]" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <p className="font-black uppercase tracking-wider text-rose-700">
                  QUY ĐỊNH NGHIÊM CẤM:
                </p>
                <p className="font-bold leading-relaxed text-rose-900">
                  {parseInlineFormatting(warningText)}
                </p>
              </div>
            </div>
          );
        }

        const contentText = line.replace(/^[-–—•*]\s*/, "").trim();

        return (
          <div
            key={idx}
            className="flex items-start gap-3.5 rounded-2xl border border-amber-100/70 bg-gradient-to-r from-white to-amber-50/50 p-3.5 sm:px-4.5 sm:py-3.5 shadow-2xs transition-all hover:border-amber-200"
          >
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-amber-500 stroke-[2.3]" />
            <div className="text-xs sm:text-[13.5px] font-semibold leading-relaxed text-slate-700">
              {parseInlineFormatting(contentText)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================================
 * COMPONENT CHÍNH
 * ========================================================================= */
export default function StudentRulesContent() {
  const { profile, loading: authLoading } = useAuth();
  const role = profile?.role;

  // Quản lý mảng ID của các rule đang mở (mặc định rỗng => không mở cái nào)
  const [openRuleIds, setOpenRuleIds] = useState<string[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingRule, setEditingRule] = useState<StudentRule | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const STUDENT_RULES_QUERY_KEY = ["student-rules"] as const;

  const {
    data: rules = [],
    isLoading: loading,
    error: queryError,
  } = useQuery<StudentRule[]>({
    queryKey: STUDENT_RULES_QUERY_KEY,
    queryFn: () => studentRulesClientService.getAll(),
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
      ? "Không thể tải nội quy."
      : null;

  // Toggle độc lập: nếu đang mở thì đóng lại, nếu đóng thì mở ra (các rule khác giữ nguyên)
  function toggleRule(id: string) {
    setOpenRuleIds((prev) =>
      prev.includes(id) ? prev.filter((ruleId) => ruleId !== id) : [...prev, id]
    );
  }

  async function handleCreate(title: string, content: string) {
    try {
      setSaving(true);
      const newRule = await studentRulesClientService.create({
        title,
        content,
      });

      queryClient.setQueryData<StudentRule[]>(
        STUDENT_RULES_QUERY_KEY,
        (current = []) => [...current, newRule]
      );
      setShowEditor(false);
      // Mở rule mới tạo
      setOpenRuleIds((prev) => [...prev, newRule.id]);

      toast.success("Đã thêm nội quy.");
    } catch (error) {
      console.error("[CREATE STUDENT RULE ERROR]", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể thêm nội quy."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(rule: StudentRule) {
    setEditingRule(rule);
    setShowEditor(false);
  }

  async function handleUpdate(title: string, content: string) {
    if (!editingRule) return;

    try {
      setSaving(true);
      const updatedRule = await studentRulesClientService.update(
        editingRule.id,
        { title, content }
      );

      queryClient.setQueryData<StudentRule[]>(
        STUDENT_RULES_QUERY_KEY,
        (current = []) =>
          current.map((rule) =>
            rule.id === updatedRule.id ? updatedRule : rule
          )
      );

      setEditingRule(null);
      // Đảm bảo rule vừa cập nhật được mở
      setOpenRuleIds((prev) =>
        prev.includes(updatedRule.id) ? prev : [...prev, updatedRule.id]
      );
      toast.success("Đã cập nhật nội quy.");
    } catch (error) {
      console.error("[UPDATE STUDENT RULE ERROR]", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể cập nhật nội quy."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      await studentRulesClientService.remove(id);

      queryClient.setQueryData<StudentRule[]>(
        STUDENT_RULES_QUERY_KEY,
        (current = []) => current.filter((rule) => rule.id !== id)
      );

      setOpenRuleIds((prev) => prev.filter((ruleId) => ruleId !== id));
      toast.success("Đã xóa nội quy.");
    } catch (error) {
      console.error("[DELETE STUDENT RULE ERROR]", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể xóa nội quy."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function confirmDelete(rule: StudentRule) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa nội quy "${rule.title}" không?`
    );
    if (!confirmed) return;
    handleDelete(rule.id);
  }

  return (
    <div className="min-h-full bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* HEADER TRANG */}
        <div className="flex items-start justify-between gap-4 rounded-[24px] border border-amber-100 bg-gradient-to-r from-white via-amber-50/60 to-yellow-50/70 p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-yellow-300 to-amber-400 text-amber-950 shadow-xs shadow-amber-200/60">
              <BookOpen className="size-5.5 stroke-[2.2]" />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                Nội quy học sinh
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-semibold italic text-slate-500">
                Các quy định và mức điểm thưởng phạt dành cho học sinh.
              </p>
            </div>
          </div>

          {/* NÚT THÊM NỘI QUY DÀNH CHO GIÁO VIÊN */}
          {!authLoading && role === "TEACHER" && (
            <Button
              className="h-10 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 px-5 text-xs font-black text-amber-950 hover:from-yellow-400 hover:to-amber-500 shadow-xs shadow-amber-200/50"
              onClick={() => {
                setEditingRule(null);
                setShowEditor(true);
              }}
            >
              <Plus className="mr-1.5 size-4" />
              Thêm nội quy
            </Button>
          )}
        </div>

        {/* EDITOR CHO ADMIN / GIÁO VIÊN */}
        {role === "TEACHER" && (showEditor || editingRule) && (
          <Card className="rounded-[26px] border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/60 p-5 shadow-2xs">
            <CardContent className="p-0">
              <div className="mb-4">
                <h2 className="text-base font-black text-slate-900">
                  {editingRule ? "Sửa nội quy" : "Thêm nội quy mới"}
                </h2>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Bạn cứ gõ bình thường: gạch đầu dòng (-) cho từng quy định, và bắt đầu bằng &ldquo;Đặc biệt:&rdquo; hoặc &ldquo;Cảnh báo:&rdquo; cho điều cấm.
                </p>
              </div>

              <RuleEditor
                key={editingRule?.id ?? "new-rule"}
                initialTitle={editingRule?.title ?? ""}
                initialContent={editingRule?.content ?? ""}
                onSave={editingRule ? handleUpdate : handleCreate}
                onCancel={() => {
                  setShowEditor(false);
                  setEditingRule(null);
                }}
                saving={saving}
              />
            </CardContent>
          </Card>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <Card className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="text-sm font-bold text-rose-700">{error}</p>
          </Card>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && rules.length === 0 && (
          <Card className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
            <BookOpen className="mx-auto mb-3 size-10 text-slate-300" />
            <p className="font-bold text-slate-700">Chưa có nội quy</p>
            <p className="mt-1 text-xs text-slate-400">
              Hiện tại hệ thống chưa cập nhật nội quy nào.
            </p>
          </Card>
        )}

        {/* DANH SÁCH NỘI QUY CHUẨN DESIGN MOCKUP */}
        {!loading && !error && rules.length > 0 && (
          <div className="space-y-3.5">
            {rules.map((rule, index) => {
              const isOpen = openRuleIds.includes(rule.id);

              return (
                <div
                  key={rule.id}
                  className={`overflow-hidden rounded-[24px] border bg-white shadow-2xs transition-all ${isOpen ? "border-amber-200 shadow-sm shadow-amber-100/40" : "border-slate-200/80 hover:border-amber-200"}`}
                >
                  {/* HEADER CỦA TỪNG NỘI QUY */}
                  <div className={`flex w-full items-center justify-between gap-4 bg-gradient-to-r from-white px-4 py-3.5 sm:px-5 ${isOpen ? "to-amber-100/60" : "to-slate-50/80"}`}>
                    {/* CLICK MỞ / ĐÓNG */}
                    <button
                      type="button"
                      onClick={() => toggleRule(rule.id)}
                      className="flex min-w-0 flex-1 items-center gap-3.5 text-left focus:outline-hidden"
                    >
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl border text-xs sm:text-sm font-black shadow-2xs ${isOpen ? "border-amber-500/20 bg-gradient-to-br from-yellow-300 to-amber-400 text-amber-950" : "border-amber-100 bg-amber-50 text-amber-700"}`}>
                        {index + 1}
                      </div>

                      <h2 className={`truncate text-sm sm:text-[15px] font-black tracking-tight transition-colors hover:text-amber-700 ${isOpen ? "text-amber-900" : "text-slate-800"}`}>
                        {rule.title}
                      </h2>
                    </button>

                    {/* NÚT THAO TÁC / MŨI TÊN */}
                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                      {!authLoading && role === "TEACHER" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEdit(rule)}
                            title="Sửa nội quy"
                            className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-amber-100/70 hover:text-amber-700 transition-colors"
                          >
                            <Pencil className="size-4" />
                            <span className="sr-only">Sửa</span>
                          </button>

                          <button
                            type="button"
                            disabled={deletingId === rule.id}
                            onClick={() => confirmDelete(rule)}
                            title="Xóa nội quy"
                            className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
                          >
                            {deletingId === rule.id ? (
                              <Loader2 className="size-4 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                            <span className="sr-only">Xóa</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleRule(rule.id)}
                        className={`flex size-8 items-center justify-center rounded-full hover:bg-amber-100 transition-colors hover:text-amber-700 ${isOpen ? "bg-amber-100/70 text-amber-600" : "text-slate-400"}`}
                      >
                        {isOpen ? (
                          <ChevronUp className="size-5 stroke-[2.5]" />
                        ) : (
                          <ChevronDown className="size-5 stroke-[2.5]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* NỘI DUNG TỰ ĐỘNG FORMAT */}
                  {isOpen && (
                    <div className="border-t border-amber-100/70 bg-gradient-to-b from-amber-50/20 to-white px-4 py-3.5 sm:px-5 sm:py-4">
                      <FormattedRuleContent rawContent={rule.content} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
