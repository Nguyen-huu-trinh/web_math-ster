'use client';
import { Clapperboard, Sparkles } from "lucide-react";
import { ResourceDialog } from "@/components/lesson-resources/resource-dialog";
import { LessonSidebar } from "@/components/lessons/lesson-sidebar";
import { DeleteResourceDialog } from "@/components/lesson-resources/delete-resource-dialog";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  ChevronLeft,
  FileText,
  CircleCheckBig,
  Circle,
  Play,
  ArrowRight,
  Pencil,
  Trash2,
  Maximize,
  Minimize,
  Lock,
  ExternalLink,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

import { useCourseDetail } from "@/hooks/use-course-detail";
import {
  useCreateLessonContent,
  useDeleteLessonContent,
  useSaveLearningProgress,
  useUpdateLessonContent,
} from "@/hooks/use-lesson";

function getYoutubeEmbedUrl(url?: string) {
  if (!url) return "";
  let videoId = "";
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  } else if (url.includes("watch?v=")) {
    videoId = new URL(url).searchParams.get("v") || "";
  } else if (url.includes("/embed/")) {
    videoId = url.split("/embed/")[1].split("?")[0];
  }
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=0&color=red`;
  }
  return url;
}

export default function LessonClientView({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const { profile } = useAuth();
  const role = profile?.role;

  const courseQuery = useCourseDetail(courseId, profile?.id);
  const createLessonContentMutation = useCreateLessonContent(courseId);
  const updateLessonContentMutation = useUpdateLessonContent(courseId);
  const deleteLessonContentMutation = useDeleteLessonContent(courseId);
  const saveLearningProgressMutation = useSaveLearningProgress(courseId);

  const course = courseQuery.course;

  const [completed, setCompleted] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [deleteResourceOpen, setDeleteResourceOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [isVideoLocked, setIsVideoLocked] = useState(false);
  const [lockedExamId, setLockedExamId] = useState<string | null>(null);
  const [sidePanel, setSidePanel] = useState<"outline" | "resources">("resources");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const resourceAccessCache = useRef<Record<string, boolean>>({});

  // 1. Tối ưu tính toán danh sách bài học với useMemo để tránh chạy lại khi re-render
  const { allLessons, lessonIndex, lesson, nextLesson, resources } = useMemo(() => {
    const lessons = course?.chapters?.flatMap((chapter: any) => chapter.lessons) ?? [];
    const index = lessons.findIndex((l: any) => l.id === lessonId);
    const current = index >= 0 ? lessons[index] : null;
    const next = index >= 0 ? lessons[index + 1] : null;
    const res = current?.contents ?? [];
    return {
      allLessons: lessons,
      lessonIndex: index,
      lesson: current,
      nextLesson: next,
      resources: res,
    };
  }, [course, lessonId]);

  // Lắng nghe sự kiện đổi trạng thái Fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!lesson) return;
    setCompleted(lesson.progress?.completed ?? lesson.completed ?? false);
  }, [lesson]);

  const checkResourceAccess = useCallback(async (resource: any, showToast: boolean = false) => {
    if (role !== "STUDENT") return true;
    if (!resource.exam_id) return true;

    const cached = resourceAccessCache.current[resource.id];
    if (cached !== undefined) {
      if (!cached && showToast) {
        toast.warning("Chưa thể xem video chữa bài", {
          description: "Cần hoàn thành bài kiểm tra trước khi xem đáp án.",
        });
      }
      return cached;
    }

    try {
      const response = await fetch(
        `/api/students/lesson-contents/${resource.id}/access`,
        { method: "GET", credentials: "include" }
      );
      const result = await response.json();
      if (!response.ok) {
        if (showToast) {
          toast.error("Không thể kiểm tra quyền truy cập", {
            description: result.message ?? "Vui lòng thử lại.",
          });
        }
        return false;
      }
      const allowed = result.allowed === true;
      resourceAccessCache.current[resource.id] = allowed;

      if (!allowed && showToast) {
        toast.warning("Chưa thể xem video chữa bài", {
          description:
            result.message ?? "Cần làm đề kiểm tra đạt trước khi xem video này.",
        });
      }
      return allowed;
    } catch (error) {
      console.error("[RESOURCE ACCESS ERROR]", error);
      if (showToast) {
        toast.error("Có lỗi xảy ra", {
          description: "Không thể kiểm tra quyền xem tài liệu.",
        });
      }
      return false;
    }
  }, [role]);

  // Kiểm tra quyền khi load video đầu tiên (không hiện toast)
  useEffect(() => {
    if (resources.length === 0) return;
    const video = resources.find((x: any) => x.type === "VIDEO");
    if (video) {
      setCurrentVideo(video);
      checkResourceAccess(video, false).then((allowed) => {
        if (allowed) {
          setIsVideoLocked(false);
          setLockedExamId(null);
        } else {
          setIsVideoLocked(true);
          setLockedExamId(video.exam_id);
        }
      });
    } else {
      setCurrentVideo(null);
      setIsVideoLocked(false);
      setLockedExamId(null);
    }
  }, [resources, checkResourceAccess]);

  const toggleFullscreen = useCallback(() => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  async function notifyMaterial(saved: unknown, send: boolean, isUpdate = false) {
    if (!send) return;
    const id = (saved as { id: string }).id;
    try {
      const response = await fetch("/api/notifications/material", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId: id, requestId: crypto.randomUUID(), isUpdate }),
      });
      if (!response.ok) throw new Error("Notification failed");
      toast.success("Đã gửi thông báo cho học sinh");
    } catch {
      toast.warning("Tài liệu đã lưu nhưng chưa gửi được thông báo. Bạn có thể mở sửa tài liệu và gửi lại.");
    }
  }
  async function createResource(values: any) {
    if (!lesson) return;
    try {
      const saved = await createLessonContentMutation.mutateAsync({
        lesson_id: lesson.id,
        title: values.title,
        type: values.type,
        provider: values.provider,
        url: values.url,
        order_index: values.order_index,
      });
      await notifyMaterial(saved, values.sendNotification === true);
      toast.success("Đã lưu tài liệu");
      setResourceDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Create resource failed");
    }
  }

  async function updateResource(values: any) {
    if (!selectedResource) return;
    try {
      const saved = await updateLessonContentMutation.mutateAsync({
        id: selectedResource.id,
        values: {
          title: values.title,
          type: values.type,
          provider: values.provider,
          url: values.url,
          order_index: values.order_index,
        },
      });
      await notifyMaterial(saved, values.sendNotification === true, true);
      toast.success("Đã cập nhật tài liệu");
      setSelectedResource(null);
      setResourceDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Update resource failed");
    }
  }

  async function deleteResource() {
    if (!selectedResource) return;
    try {
      await deleteLessonContentMutation.mutateAsync(selectedResource.id);
      toast.success("Resource deleted");
      setDeleteResourceOpen(false);
      setSelectedResource(null);
    } catch (error) {
      console.error(error);
      toast.error("Delete resource failed");
    }
  }

  async function completeLesson() {
    if (!profile || !lesson) return;
    if (completed) return;

    await saveLearningProgressMutation.mutateAsync({
      student_id: profile.id,
      lesson_id: lesson.id,
      is_completed: true,
    });

    setCompleted(true);
    toast.success("Lesson completed");
  }

  async function handleSelectVideo(resource: any) {
    setCurrentVideo(resource);
    const allowed = await checkResourceAccess(resource, true);
    if (allowed) {
      setIsVideoLocked(false);
      setLockedExamId(null);
    } else {
      setIsVideoLocked(true);
      setLockedExamId(resource.exam_id);
    }
  }

  async function openResource(resource: any) {
    if (role !== "STUDENT") {
      window.open(resource.file_links?.url, "_blank", "noopener,noreferrer");
      return;
    }

    if (!resource.exam_id) {
      window.open(resource.file_links?.url, "_blank", "noopener,noreferrer");
      await completeLesson();
      return;
    }

    const allowed = await checkResourceAccess(resource, true);
    if (!allowed) return;

    window.open(
      `/student-exams/open/${resource.exam_id}`,
      "_blank",
      "noopener,noreferrer"
    );
    await completeLesson();
  }

  if (!course) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  if (lessonIndex === -1) notFound();

  const chapterId = lesson.chapter_id ?? lesson.chapterId ?? course.chapters?.find(
    (chapter: any) => chapter.lessons?.some((item: any) => item.id === lesson.id)
  )?.id;
  const returnParams = new URLSearchParams({ courseId: course.id });
  if (chapterId) returnParams.set("chapterId", chapterId);

  return (
    <div className="dark flex min-h-dvh w-full flex-col overflow-hidden bg-[#0f1426] text-slate-200 lg:h-dvh">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
<div className="flex min-w-0 flex-1 items-center gap-2.5">
  <Link
    href={`/courses?${returnParams.toString()}`}
    className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-800 px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
  >
    <ChevronLeft className="size-3.5 shrink-0" />
    <span className="hidden xs:inline">Về khóa học</span>
  </Link>

  <h1 className="min-w-0 flex-1 line-clamp-2 text-xs font-bold leading-tight sm:text-sm sm:leading-normal">
    {lesson.title}
  </h1>
</div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-xs text-slate-400">Bài {lessonIndex + 1}/{allLessons.length}</span>
          {role === "STUDENT" && (
            <Button variant="outline" onClick={completeLesson} disabled={completed || saveLearningProgressMutation.isPending} className="h-8 rounded-lg border-slate-700 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700">
              {completed ? <CircleCheckBig className="size-3.5" /> : <Circle className="size-3.5" />}
              {completed ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
            </Button>
          )}
          {nextLesson && (
            <Link href={`/courses/${course.id}/lessons/${nextLesson.id}`} prefetch={false} className="inline-flex h-8 items-center gap-2 rounded-lg bg-amber-500 px-3 text-xs font-bold text-slate-950 hover:bg-amber-400">
              Bài tiếp <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      </header>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="flex min-h-0 min-w-0 flex-col bg-black">
          <div
            ref={videoContainerRef}
            className="relative aspect-video w-full overflow-hidden bg-black group lg:aspect-auto lg:min-h-0 lg:flex-1"
          >
            {currentVideo ? (
              isVideoLocked ? (
                /* Giao diện hiển thị khi Video bị khóa */
                <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-white bg-slate-900">
                  <div className="flex size-14 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-amber-400">
                    <Lock className="size-7" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-md">
                    <h3 className="text-lg font-semibold">{currentVideo?.title}</h3>
                    <p className="text-sm text-slate-400">
                      Video này yêu cầu bạn hoàn thành bài kiểm tra đạt điều kiện trước khi mở khóa nội dung.
                    </p>
                  </div>
                  {lockedExamId && (
                    <Button
                      className="mt-2 gap-2 bg-amber-500 text-black hover:bg-amber-400 font-medium"
                      onClick={() => window.open(`/student-exams/open/${lockedExamId}`, "_blank")}
                    >
                      Làm bài kiểm tra ngay
                      <ExternalLink className="size-4" />
                    </Button>
                  )}
                </div>
              ) : (
                /* Giao diện phát Video bình thường */
                <>
                  <p className="text-white absolute top-3 left-3 z-30 pointer-events-none text-sm font-medium drop-shadow-md">
                    {currentVideo?.title}
                  </p>

                  {/* Lớp phủ che YouTube UI */}
                  <div
                    className="absolute top-0 left-0 w-80 h-16 z-20 bg-transparent pointer-events-auto cursor-default"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div
                    className="absolute bottom-0 left-0 w-80 h-16 z-20 bg-transparent pointer-events-auto cursor-default"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div
                    className="absolute bottom-0 right-0 w-80 h-16 z-20 bg-transparent pointer-events-auto cursor-default"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="absolute bottom-3 right-3 z-30 p-2 text-white bg-black/60 hover:bg-black/90 rounded-md transition-all pointer-events-auto"
                    title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                  >
                    {isFullscreen ? (
                      <Minimize className="size-4" />
                    ) : (
                      <Maximize className="size-4" />
                    )}
                  </button>
                  <div 
                    className="absolute bottom-[3px] left-0 right-0 h-[3px] bg-white/20 z-20 pointer-events-none backdrop-blur-[1px]"
                  />
                  <iframe
                    key={currentVideo?.id}
                    className="w-full h-full border-0 relative z-10"
                    src={
                      currentVideo?.file_links?.url
                        ? getYoutubeEmbedUrl(currentVideo.file_links.url)
                        : undefined
                    }
                    title={currentVideo?.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </>
              )
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No video
              </div>
            )}
          </div>
<div className="flex shrink-0 items-center gap-2 border-t border-slate-800/80 bg-[#0D121F] px-4 py-2 text-xs text-slate-400">
  <Clapperboard className="size-3.5 text-amber-400" />
  <span className="font-medium text-slate-300">Chế độ rạp chiếu phim</span>
  <span className="text-slate-600">•</span>
  <Sparkles className="size-3 text-amber-400/80" />
  <span className="font-semibold text-slate-200">Anh Huy MATH-STER</span>
</div>
        </main>
        <aside className="flex min-h-0 min-w-0 flex-col border-t border-slate-800 bg-[#0f1426] lg:border-l lg:border-t-0">
          <div className="grid shrink-0 grid-cols-2 border-b border-slate-800" aria-label="Nội dung bên cạnh video">
            <button type="button" aria-pressed={sidePanel === "outline"} aria-controls="lesson-side-panel" onClick={() => setSidePanel("outline")} className={`border-b-2 px-3 py-3.5 text-xs font-bold transition-colors ${sidePanel === "outline" ? "border-amber-500 bg-amber-500/5 text-amber-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}>Mục lục</button>
            <button type="button" aria-pressed={sidePanel === "resources"} aria-controls="lesson-side-panel" onClick={() => setSidePanel("resources")} className={`border-b-2 px-3 py-3.5 text-xs font-bold transition-colors ${sidePanel === "resources" ? "border-amber-500 bg-amber-500/5 text-amber-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}>Tài liệu ({resources.length})</button>
          </div>
          <div id="lesson-side-panel" className="min-h-0 max-h-[65dvh] overflow-y-auto lg:max-h-none lg:flex-1">
            {sidePanel === "outline" ? (
              <LessonSidebar course={course} currentLessonId={lesson.id} embedded />
            ) : (
              <div>
                {role === "TEACHER" && <Button variant="outline" className="m-3 mb-0 border-slate-700 bg-slate-800 text-xs" onClick={() => { setSelectedResource(null); setResourceDialogOpen(true); }}>Thêm tài liệu</Button>}
          <div className="p-3">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Tài nguyên đi kèm bài {lessonIndex + 1}
            </h2>
            <div className="grid gap-3">
              {(lesson.contents ?? []).length === 0 ? (
                <p className="text-sm text-slate-400">
                  Chưa có tài liệu bài học này.
                </p>
              ) : (
                (lesson.contents ?? []).map((resource: any) => (
                  <div
                    key={resource.id}
                    className={`flex min-w-0 flex-wrap items-center gap-3 rounded-2xl border px-3.5 py-4 transition-colors ${currentVideo?.id === resource.id ? "border-amber-500/30 bg-amber-500/[0.06]" : resource.type === "EXAM" ? "border-emerald-500/25 bg-emerald-500/[0.05]" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"}`}
                  >
                    <div className={`flex size-6 shrink-0 items-center justify-center ${currentVideo?.id === resource.id ? "text-amber-400" : resource.type === "VIDEO" ? "text-rose-400" : resource.type === "EXAM" ? "text-emerald-400" : "text-sky-400"}`}>
                      {resource.type === "VIDEO" ? (
                        <Play className="size-5" />
                      ) : resource.type === "EXAM" ? (
                        <CircleCheckBig className="size-5" />
                      ) : (
                        <FileText className="size-5" />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className={`break-words text-sm font-bold leading-relaxed ${resource.type === "EXAM" ? "text-emerald-300" : "text-slate-100"}`}>
                        {resource.title}
                      </span>
                    </div>

                    {resource.type === "VIDEO" ? (
                      <Button
                        variant="ghost"
                        className={`h-8 shrink-0 rounded-lg px-2.5 text-xs font-bold ${currentVideo?.id === resource.id ? "text-amber-400 hover:bg-amber-500/10 hover:text-amber-300" : "border border-slate-700 bg-slate-800 text-rose-300 hover:bg-slate-700 hover:text-rose-200"}`}
                        onClick={() => handleSelectVideo(resource)}
                      >
                        {currentVideo?.id === resource.id ? (isVideoLocked ? "Đang khóa" : "Đang xem") : "Xem video"}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className={`h-8 shrink-0 rounded-lg px-2.5 text-xs font-bold ${resource.type === "EXAM" ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 hover:text-slate-950" : "border border-slate-700 bg-slate-800 text-sky-300 hover:bg-slate-700 hover:text-sky-200"}`}
                        onClick={() => openResource(resource)}
                      >
                        {resource.type === "EXAM" ? "Làm bài" : "Mở file"}
                      </Button>
                    )}

                    {role === "TEACHER" && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedResource(resource);
                            setResourceDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => {
                            setSelectedResource(resource);
                            setDeleteResourceOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
              </div>
            )}
          </div>
        </aside>
      </div>
      <ResourceDialog
        open={resourceDialogOpen}
        resource={selectedResource}
        onClose={() => {
          setResourceDialogOpen(false);
          setSelectedResource(null);
        }}
        onSubmit={selectedResource ? updateResource : createResource}
      />

      <DeleteResourceDialog
        open={deleteResourceOpen}
        resource={selectedResource}
        onClose={() => {
          setDeleteResourceOpen(false);
          setSelectedResource(null);
        }}
        onDelete={deleteResource}
      />

    </div>
  );
}
