"use client";

import { useEffect, useState } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Loader2,
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

type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

interface Props {
  role: UserRole;
}

export default function StudentRulesPage({ role }: Props) {

  const [openRuleId, setOpenRuleId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingRule, setEditingRule] = useState<StudentRule | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
const queryClient = useQueryClient();

const STUDENT_RULES_QUERY_KEY =
  ["student-rules"] as const;

const {
  data: rules = [],
  isLoading: loading,
  error: queryError,
} = useQuery<StudentRule[]>({
  queryKey: STUDENT_RULES_QUERY_KEY,
  queryFn: () =>
    studentRulesClientService.getAll(),

  staleTime: 5 * 60 * 1000,

  gcTime: 30 * 60 * 1000,
});

const error =
  queryError instanceof Error
    ? queryError.message
    : queryError
      ? "Không thể tải nội quy."
      : null;
useEffect(() => {
  if (
    rules.length > 0 &&
    openRuleId === null
  ) {
    setOpenRuleId(rules[0].id);
  }
}, [rules, openRuleId]);

  

  function toggleRule(id: string) {
    setOpenRuleId((current) => (current === id ? null : id));
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
      setOpenRuleId(newRule.id);

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
    if (!editingRule) {
      return;
    }

    try {
      setSaving(true);

      const updatedRule = await studentRulesClientService.update(
        editingRule.id,
        {
          title,
          content,
        }
      );

      queryClient.setQueryData<StudentRule[]>(
        STUDENT_RULES_QUERY_KEY,
        (current = []) =>
          current.map((rule) =>
            rule.id === updatedRule.id
              ? updatedRule
              : rule
          )
      );

      setEditingRule(null);
      setOpenRuleId(updatedRule.id);

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
  (current = []) =>
    current.filter(
      (rule) => rule.id !== id
    )
);

      if (openRuleId === id) {
        setOpenRuleId(null);
      }

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

    if (!confirmed) {
      return;
    }

    handleDelete(rule.id);
  }

  return (
    <div className="min-h-full bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Nội quy học sinh
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Các quy định dành cho học sinh.
              </p>
            </div>
          </div>

          {/* CHỈ GIÁO VIÊN */}
          {role === "TEACHER" && (
            <Button
              onClick={() => {
                setEditingRule(null);
                setShowEditor(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm nội quy
            </Button>
          )}
        </div>

        {role === "TEACHER" && (showEditor || editingRule) && (
          <Card className="mb-6">
            <CardContent className="p-5 md:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">
                  {editingRule ? "Sửa nội quy" : "Thêm nội quy"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {editingRule
                    ? "Chỉnh sửa nội dung nội quy."
                    : "Nhập đề mục và nội dung nội quy."}
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

        {/* LOADING */}
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* EMPTY */}
        {!loading && !error && rules.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

              <p className="font-medium">Chưa có nội quy</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Hiện tại chưa có nội quy nào.
              </p>
            </CardContent>
          </Card>
        )}

        {/* RULES LIST */}
        {!loading && !error && rules.length > 0 && (
          <div className="space-y-3">
            {rules.map((rule, index) => {
              const isOpen = openRuleId === rule.id;

              return (
                <Card
                  key={rule.id}
                  className="overflow-hidden transition-shadow hover:shadow-md"
                >
                  <div className="flex w-full items-center justify-between gap-4 py-2 px-2 md:py-0 md:px-4">
                    {/* CLICK MỞ / ĐÓNG (TIÊU ĐỀ & SỐ THỨ TỰ) */}
                    <button
                      type="button"
                      onClick={() => toggleRule(rule.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left focus:outline-none"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground md:h-9 md:w-9 md:text-sm">
                        {index + 1}
                      </div>

                      <h2 className="text-sm font-semibold md:text-base text-foreground truncate">
                        {rule.title}
                      </h2>
                    </button>

                    {/* RIGHT ACTIONS */}
                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                      {role === "TEACHER" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEdit(rule)}
                            title="Sửa nội quy"
                            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Sửa</span>
                          </button>

                          <button
                            type="button"
                            disabled={deletingId === rule.id}
                            onClick={() => confirmDelete(rule)}
                            title="Xóa nội quy"
                            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          >
                            {deletingId === rule.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Xóa</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleRule(rule.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors"
                      >
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* NỘI DUNG MỞ RỘNG */}
                  {isOpen && (
                    <CardContent className="border-t bg-muted/20 px-4 py-4 md:px-5 md:py-5">
<div
  className="text-sm leading-7 text-foreground md:text-base [&_*]:!text-foreground [&_a]:!text-primary"
  dangerouslySetInnerHTML={{
    __html: rule.content,
  }}
/>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}