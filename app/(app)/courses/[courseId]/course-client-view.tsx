'use client'

import { DeleteLessonDialog } from "@/components/lessons/delete-lesson-dialog";
import { toast } from "sonner";
import { useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChapterDialog } from "@/components/chapters/chapter-dialog";
import {
  BookOpen,
  CircleCheckBig,
  Circle,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  Users
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { LessonDialog } from "@/components/lessons/lesson-dialog";

import { Accordion } from '@/components/ui/accordion'
import { DeleteChapterDialog } from "@/components/chapters/delete-chapter-dialog";
import { useAuth } from '@/providers/auth-provider'

import { ChapterCard } from "@/components/chapters/chapter-card";

import {
  useCourseDetail,
  useCreateChapter,
  useCreateLesson,
  useDeleteChapter,
  useDeleteLesson,
  useUpdateChapter,
  useUpdateLesson,
} from "@/hooks/use-course-detail";

interface CourseClientViewProps {
  courseId: string;
  embedded?: boolean;
}

export default function CourseClientView({ courseId, embedded = false }: CourseClientViewProps) {
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [selectedChapterForLesson, setSelectedChapterForLesson] = useState<any>(null);

  const { profile } = useAuth();
  const role = profile?.role;

  const courseQuery = useCourseDetail(courseId, profile?.id);
  const createChapterMutation = useCreateChapter(courseId);
  const updateChapterMutation = useUpdateChapter(courseId);
  const deleteChapterMutation = useDeleteChapter(courseId);
  const createLessonMutation = useCreateLesson(courseId);
  const updateLessonMutation = useUpdateLesson(courseId);
  const deleteLessonMutation = useDeleteLesson(courseId);

  const course = courseQuery.course;
  const chapters = course?.chapters ?? [];
  const loading = courseQuery.isLoading;
  const [deleteLessonOpen, setDeleteLessonOpen] = useState(false);

  async function createChapter(values: { title: string; order_index: number }) {
    try {
      await createChapterMutation.mutateAsync({
        course_id: courseId,
        title: values.title,
        order_index: values.order_index,
      });
      toast.success("Chapter created");
      setChapterDialogOpen(false);
      setSelectedChapterForLesson(null);
    } catch (error) {
      console.error(error);
      toast.error("Create chapter failed");
    }
  }

  async function deleteLesson() {
    if (!selectedLesson) return;
    try {
      await deleteLessonMutation.mutateAsync(selectedLesson.id);
      toast.success("Lesson deleted");
      setDeleteLessonOpen(false);
      setSelectedLesson(null);
      setSelectedChapterForLesson(null);
    } catch (e) {
      console.error(e);
      toast.error("Delete lesson failed");
    }
  }

  async function updateChapter(values: { title: string; order_index: number }) {
    if (!selectedChapter) return;
    try {
      await updateChapterMutation.mutateAsync({
        id: selectedChapter.id,
        values,
      });
      toast.success("Chapter updated");
      setChapterDialogOpen(false);
      setSelectedChapter(null);
    } catch (error) {
      console.error(error);
      toast.error("Update chapter failed");
    }
  }

  async function deleteChapter() {
    if (!selectedChapter) return;
    try {
      await deleteChapterMutation.mutateAsync(selectedChapter.id);
      toast.success("Chapter deleted");
      setDeleteOpen(false);
      setSelectedChapter(null);
    } catch (error) {
      console.error(error);
      toast.error("Delete chapter failed");
    }
  }

  interface LessonFormValues {
    title: string;
    order_index: number;
    is_active: boolean;
  }

  async function createLesson(values: LessonFormValues) {
    if (!selectedChapterForLesson) return;
    try {
      await createLessonMutation.mutateAsync({
        chapter_id: selectedChapterForLesson.id,
        title: values.title,
        order_index: values.order_index,
        is_active: values.is_active,
      });
      toast.success("Lesson created");
      setLessonDialogOpen(false);
      setSelectedLesson(null);
      setSelectedChapterForLesson(null);
    } catch (error) {
      console.error(error);
      toast.error("Create lesson failed");
    }
  }

  async function updateLesson(values: LessonFormValues) {
    if (!selectedLesson) return;
    try {
      await updateLessonMutation.mutateAsync({
        id: selectedLesson.id,
        values: {
          title: values.title,
          order_index: values.order_index,
          is_active: values.is_active,
        },
      });
      toast.success("Lesson updated");
      setLessonDialogOpen(false);
      setSelectedLesson(null);
      setSelectedChapterForLesson(null);
    } catch (error) {
      console.error(error);
      toast.error("Update lesson failed");
    }
  }

  if (loading) {
    return <div className="py-10 text-center text-muted-foreground">Loading...</div>;
  }

  if (!course) {
    notFound();
  }

  const allLessons = chapters.flatMap((chapter: any) => chapter.lessons ?? []);
  const completedCount = allLessons.filter(
    (lesson: any) => lesson.progress?.completed ?? lesson.completed ?? false
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Ẩn nút Quay về nếu đang hiển thị ở cột bên phải */}
      {!embedded && (
        <Link
          prefetch={false}
          href="/courses"
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Quay về
        </Link>
      )}

      {/* Header khóa học không còn hình ảnh */}
      <div className="flex flex-col gap-4 pb-2 border-b">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <Badge variant={course.is_active ? "default" : "secondary"}>
              {course.is_active ? "Active" : "Inactive"}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="size-3.5" />
              <span>{course.totalLessons} bài</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {course.name}
          </h1>

          {course.description && (
            <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        {role === "STUDENT" ? (
          <div className="max-w-md pt-1">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
              <span>Tiến độ: {completedCount}/{course.totalLessons} bài</span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={() => {
                setSelectedChapter(null);
                setChapterDialogOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Chapter
            </Button>
            
            <Link href={`/courses/${course.id}/students`}>
              <Button size="sm" variant="outline">
                <Users className="mr-1.5 h-4 w-4" />
                Học sinh
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Danh sách chương và bài học */}
      <Card>
        <CardContent className="pt-6">
          <Accordion defaultValue={chapters.map((c: any) => c.id)}>
            {chapters.map((chapter: any) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                onAddLesson={
                  role === "TEACHER"
                    ? (chapter) => {
                        setSelectedChapterForLesson(chapter);
                        setSelectedLesson(null);
                        setLessonDialogOpen(true);
                      }
                    : undefined
                }
                onEdit={
                  role === "TEACHER"
                    ? (chapter) => {
                        setSelectedChapter(chapter);
                        setChapterDialogOpen(true);
                      }
                    : undefined
                }
                onDelete={
                  role === "TEACHER"
                    ? (chapter) => {
                        setSelectedChapter(chapter);
                        setDeleteOpen(true);
                      }
                    : undefined
                }
              >
                <div className="space-y-2">
                  {(chapter.lessons ?? []).map((lesson: any) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted transition-colors"
                    >
                      <Link
                        href={`/courses/${course.id}/lessons/${lesson.id}`}
                        prefetch={false}
                        className="flex flex-1 items-center gap-3"
                      >
                        {lesson.completed ? (
                          <CircleCheckBig className="text-primary" size={18} />
                        ) : (
                          <Circle size={18} />
                        )}
                        <div className="flex-1 text-sm font-medium">
                          {lesson.title}
                        </div>
                      </Link>

                      {role === "TEACHER" && (
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedLesson(lesson);
                              setSelectedChapterForLesson(chapter);
                              setLessonDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => {
                              setSelectedLesson(lesson);
                              setSelectedChapterForLesson(chapter);
                              setDeleteLessonOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ChapterCard>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <ChapterDialog
        open={chapterDialogOpen}
        chapter={selectedChapter}
        onClose={() => {
          setChapterDialogOpen(false);
          setSelectedChapter(null);
        }}
        onSubmit={selectedChapter ? updateChapter : createChapter}
      />

      <DeleteChapterDialog
        open={deleteOpen}
        chapter={selectedChapter}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedChapter(null);
        }}
        onDelete={deleteChapter}
      />

      <LessonDialog
        open={lessonDialogOpen}
        lesson={selectedLesson}
        onClose={() => {
          setLessonDialogOpen(false);
          setSelectedLesson(null);
          setSelectedChapterForLesson(null);
        }}
        onSubmit={selectedLesson ? updateLesson : createLesson}
      />

      <DeleteLessonDialog
        open={deleteLessonOpen}
        lesson={selectedLesson}
        onClose={() => {
          setDeleteLessonOpen(false);
          setSelectedLesson(null);
        }}
        onDelete={deleteLesson}
      />
    </div>
  );
}