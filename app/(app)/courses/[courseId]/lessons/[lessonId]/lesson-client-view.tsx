'use client';

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
  Menu,
  Maximize,
  Minimize,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [showLessonSidebar, setShowLessonSidebar] = useState(false);
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

  useEffect(() => {
    if (resources.length === 0) return;
    const video = resources.find((x: any) => x.type === "VIDEO");
    if (video) {
      setCurrentVideo(video);
    }
  }, [resources]);

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

  async function createResource(values: any) {
    if (!lesson) return;
    try {
      await createLessonContentMutation.mutateAsync({
        lesson_id: lesson.id,
        title: values.title,
        type: values.type,
        provider: values.provider,
        url: values.url,
        order_index: values.order_index,
      });
      toast.success("Resource created");
      setResourceDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Create resource failed");
    }
  }

  async function updateResource(values: any) {
    if (!selectedResource) return;
    try {
      await updateLessonContentMutation.mutateAsync({
        id: selectedResource.id,
        values: {
          title: values.title,
          type: values.type,
          provider: values.provider,
          url: values.url,
          order_index: values.order_index,
        },
      });
      toast.success("Resource updated");
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

  async function checkResourceAccess(resource: any) {
    if (role !== "STUDENT") return true;
    if (!resource.exam_id) return true;

    const cached = resourceAccessCache.current[resource.id];
    if (cached !== undefined) return cached;

    try {
      const response = await fetch(
        `/api/students/lesson-contents/${resource.id}/access`,
        { method: "GET", credentials: "include" }
      );
      const result = await response.json();
      if (!response.ok) {
        toast.error("Không thể kiểm tra quyền truy cập", {
          description: result.message ?? "Vui lòng thử lại.",
        });
        return false;
      }
      const allowed = result.allowed === true;
      resourceAccessCache.current[resource.id] = allowed;

      if (!allowed) {
        toast.warning("Chưa thể xem đáp án", {
          description:
            result.message ?? "Cần làm đề kiểm tra trước khi xem đáp án.",
        });
      }
      return allowed;
    } catch (error) {
      console.error("[RESOURCE ACCESS ERROR]", error);
      toast.error("Có lỗi xảy ra", {
        description: "Không thể kiểm tra quyền xem tài liệu.",
      });
      return false;
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

    const allowed = await checkResourceAccess(resource);
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

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/courses/${course.id}`}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {course.name}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        <div className="hidden lg:block">
          <LessonSidebar course={course} currentLessonId={lesson.id} />
        </div>
        <div className="flex flex-col gap-5">
          <div
            ref={videoContainerRef}
            className="relative aspect-video w-full overflow-hidden rounded-xl border bg-black group"
          >
            {currentVideo ? (
              <>
                <p className="text-white absolute top-3 left-3 z-30 pointer-events-none text-sm font-medium drop-shadow-md">
                  {currentVideo?.title}
                </p>

                {/* Giữ nguyên Lớp phủ che YouTube UI */}
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
                  className="absolute bottom-[3px] left-0 right-0 h-[3px] bg-gray-600 z-20 pointer-events-none mix-blend-multiply" 
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
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No video
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Play className="size-3.5" />
              {resources.filter((x: any) => x.type === "VIDEO").length} Video
              <span aria-hidden>·</span>
              Bài học {lessonIndex + 1} trong {allLessons.length}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              {lesson.title}
            </h1>
            <p className="text-muted-foreground">
              Bài học này có{" "}
              <strong>{lesson.contents?.length ?? 0} tài liệu</strong>.
            </p>
          </div>

          {role === "STUDENT" ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant={completed ? "outline" : "default"}
                onClick={completeLesson}
              >
                {completed ? (
                  <CircleCheckBig data-icon="inline-start" />
                ) : (
                  <Circle data-icon="inline-start" />
                )}
                {completed ? "Hoàn thành" : "Đánh dấu hoàn thành"}
              </Button>
              {nextLesson ? (
                <Link
                  href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                >
                  <Button variant="ghost">
                    Bài học tiếp theo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">Chỉnh sửa bài học</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedResource(null);
                  setResourceDialogOpen(true);
                }}
              >
                Add Resource
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tài liệu</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
              {(lesson.contents ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có tài liệu bài học này.
                </p>
              ) : (
                (lesson.contents ?? []).map((resource: any) => (
                  <div
                    key={resource.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                      {resource.type === "VIDEO" ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">
                        {resource.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {resource.provider}
                      </span>
                    </div>

                    {resource.type === "VIDEO" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          const allowed = await checkResourceAccess(resource);
                          if (!allowed) return;
                          setCurrentVideo({ ...resource });
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => openResource(resource)}
                      >
                        Mở
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
            </CardContent>
          </Card>
        </div>
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

      {showLessonSidebar && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Đóng danh sách bài học"
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowLessonSidebar(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[320px] max-w-[85vw] bg-background shadow-2xl">
            <LessonSidebar
              course={course}
              currentLessonId={lesson.id}
              mobile
              onClose={() => setShowLessonSidebar(false)}
            />
          </div>
        </div>
      )}

      {!showLessonSidebar && (
        <button
          type="button"
          onClick={() => setShowLessonSidebar(true)}
          className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl transition-all hover:scale-105 active:scale-95 lg:hidden"
          aria-label="Mở danh sách bài học"
        >
          <Menu className="size-6" />
        </button>
      )}
    </div>
  );
}