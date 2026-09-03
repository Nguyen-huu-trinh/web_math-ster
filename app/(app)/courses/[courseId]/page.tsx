'use client'
import { DeleteLessonDialog } from "@/components/lessons/delete-lesson-dialog";
import { toast } from "sonner";
import { use, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChapterDialog } from "@/components/chapters/chapter-dialog";
import {
  BookOpen,
  CircleCheckBig,
  Circle,
  Play,
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

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { DeleteChapterDialog } from "@/components/chapters/delete-chapter-dialog";
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'



import {
  ChapterCard,
} from "@/components/chapters/chapter-card";

import {
  useCourseDetail,
  useCreateChapter,
  useCreateLesson,
  useDeleteChapter,
  useDeleteLesson,
  useUpdateChapter,
  useUpdateLesson,
} from "@/hooks/use-course-detail";
export default function CourseDetailPage({
  params,
}: {
  params: Promise<{
    courseId: string
  }>
}) {
  const [chapterDialogOpen, setChapterDialogOpen] =
  useState(false);

  const [selectedChapter, setSelectedChapter] =
  useState<any>(null);

  const [deleteOpen, setDeleteOpen] =
  useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] =
  useState(false);

const [selectedLesson, setSelectedLesson] =
  useState<any>(null);

const [selectedChapterForLesson, setSelectedChapterForLesson] =
  useState<any>(null);

  const { courseId } = use(params)

  const { profile } = useAuth()

  const role = profile?.role

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
  const [deleteLessonOpen, setDeleteLessonOpen] =
useState(false);
/* Legacy manual loading replaced by useCourseDetail above.
useEffect(() => {
    if (!profile) return;

    loadCourse();
}, [courseId, profile]);

  async function loadCourse() {
    try {
      const data =
  await courseDetailService.getCourseDetail(
    courseId,
    profile?.id
  );

setCourse(data);

setChapters(data.chapters ?? []);
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

*/

  async function createChapter(values: {
  title: string;
  order_index: number;
}) {
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
async function updateChapter(values: {
  title: string;
  order_index: number;
}) {
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
    return (
      <div className="py-10 text-center">
        Loading...
      </div>
    )
  }

  if (!course) {
    notFound()
  }

  const allLessons =
  chapters.flatMap(
    (chapter: any) => chapter.lessons ?? []
  );

  const completedCount =
    allLessons.filter(
      (lesson: any) => lesson.progress?.completed ??lesson.completed ??false
    ).length

  return (
    <div className="flex flex-col gap-6">

      <Link
        href="/courses"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Quay về
      </Link>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr] items-start">

        <div className="relative h-44 overflow-hidden rounded-xl border bg-muted">

          <Image
            src={
                course.thumbnail_url ??
                "/placeholder.svg"
            }
            alt={course.name}
            fill
            className="object-cover"
        />

        </div>

        <div className="flex flex-col justify-center gap-4">

          <div>

            <Badge>

              {course.is_active
                ? "Active"
                : "Inactive"}

            </Badge>

            <h1 className="mt-3 text-3xl font-bold">

              {course.name}

            </h1>

            <p className="mt-2 text-muted-foreground">

              {course.description}

            </p>

          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">

            <BookOpen className="size-4" />

            {course.totalLessons} bài

          </div>

          {role === "STUDENT" ? (

            <div>

              <div className="flex justify-between text-sm mb-2">

                <span>

                  {completedCount}/
                  {course.totalLessons}

                </span>

                <span>

                  {course.progress}%

                </span>

              </div>

              <Progress
                value={course.progress}
              />

            </div>

          ) : (

            <div className="flex gap-2">

              <Button
              onClick={() => {
                setSelectedChapter(null);
                setChapterDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Chapter
            </Button>

              <Button
                variant="outline"
              >

                Edit Course

              </Button>
              <Link href={`/courses/${course.id}/students`}>
                <Button variant="outline">
                  <Users />
                  Học sinh
                </Button>
              </Link>

            </div>

          )}

        </div>

      </div>

      <Card>

  <CardContent className="pt-6">

    <Accordion
      defaultValue={chapters.map(
        (c: any) => c.id
      )}
    >

      {chapters.map((chapter: any) => (

        <ChapterCard
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
    className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted"
>

    <Link
        href={`/courses/${course.id}/lessons/${lesson.id}`}
        className="flex flex-1 items-center gap-3"
    >

        {lesson.completed ? (
            <CircleCheckBig
                className="text-primary"
                size={18}
            />
        ) : (
            <Circle size={18} />
        )}

        <div className="flex-1">

            <div>{lesson.title}</div>

            {/* <div className="flex gap-2 text-xs text-muted-foreground">
                <Play size={12} />
                {lesson.contents?.length ?? 0} resources
            </div> */}

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
                className="text-red-500"
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
  onSubmit={
    selectedChapter
      ? updateChapter
      : createChapter
  }
/>
<DeleteChapterDialog
    open={deleteOpen}
    chapter={selectedChapter}
    onClose={()=>{
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
  onSubmit={
    selectedLesson
      ? updateLesson
      : createLesson
  }
/>

<DeleteLessonDialog

open={deleteLessonOpen}

lesson={selectedLesson}

onClose={()=>{

setDeleteLessonOpen(false);

setSelectedLesson(null);

}}

onDelete={deleteLesson}

/>
    </div>
  )
}
