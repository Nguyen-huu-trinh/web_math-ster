'use client'
import { ResourceDialog } from "@/components/lesson-resources/resource-dialog";

import { DeleteResourceDialog } from "@/components/lesson-resources/delete-resource-dialog";

import { use, useEffect, useState } from "react";
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronLeft,
  FileText,
  Download,
  ClipboardList,
  CircleCheckBig,
  Circle,
  Play,
  ArrowRight,
  Pencil,
Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { toast } from 'sonner'

import {
  useCourseDetail,
} from "@/hooks/use-course-detail";
import {
  useCreateLessonContent,
  useDeleteLessonContent,
  useSaveLearningProgress,
  useUpdateLessonContent,
} from "@/hooks/use-lesson";



// const DOC_LABEL: Record<string, string> = {
//   pdf: 'PDF',
//   slide: 'Slides',
//   sheet: 'Worksheet',
// }
function getYoutubeEmbedUrl(url?: string) {
  if (!url) return "";

  // https://youtu.be/VIDEO_ID
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }

  // https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes("watch?v=")) {
    const id = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${id}`;
  }

  // Đã là link embed
  if (url.includes("/embed/")) {
    return url;
  }

  return url;
}

function getPdfViewerUrl(url?: string) {
  if (!url) return "";

  if (
    url.includes("drive.google.com") &&
    url.includes("/view")
  ) {
    return url.replace("/view", "/preview");
  }

  return url;
}


export default function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = use(params)
  const { profile } = useAuth();

  const role = profile?.role;
  const courseQuery = useCourseDetail(courseId, profile?.id);
  const createLessonContentMutation = useCreateLessonContent(courseId);
  const updateLessonContentMutation = useUpdateLessonContent(courseId);
  const deleteLessonContentMutation = useDeleteLessonContent(courseId);
  const saveLearningProgressMutation = useSaveLearningProgress(courseId);
  const course = courseQuery.course;

  const [completed, setCompleted] =
    useState(false);

  const [resourceDialogOpen,setResourceDialogOpen]=
useState(false);

const [deleteResourceOpen,setDeleteResourceOpen]=
useState(false);

const [selectedResource,setSelectedResource]=
useState<any>(null);
const [currentVideo, setCurrentVideo] =
    useState<any>(null);



/* Legacy manual loading replaced by useCourseDetail above.
async function load() {
  const data =
    await getCourseDetail(
      courseId,
      profile?.id
    );

  setCourse(data);
}



*/

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


const allLessons =
  course?.chapters?.flatMap(
    (chapter: any) => chapter.lessons
  ) ?? [];

const lessonIndex =
  allLessons.findIndex(
    (l: any) => l.id === lessonId
  );

const lesson =
  lessonIndex >= 0
    ? allLessons[lessonIndex]
    : null;
//     console.log("LESSON", lesson);
// console.log("CONTENTS", lesson?.contents);

const nextLesson =
  lessonIndex >= 0
    ? allLessons[lessonIndex + 1]
    : null;

const resources = lesson?.contents ?? [];
console.log("RESOURCES", resources);
useEffect(() => {
   console.log(
    "CURRENT VIDEO FULL",
    JSON.stringify(currentVideo, null, 2)
);
}, [currentVideo]);

const firstVideo =
  resources.find(
    (x: any) => x.type === "VIDEO"
  ) ?? null;

    useEffect(() => {
  if (!lesson) return;

  setCompleted(
    lesson.progress?.completed ??
    lesson.completed ??
    false
  );
}, [lesson]);

useEffect(() => {
    if (resources.length === 0) return;

    const video = resources.find(
        (x:any) => x.type === "VIDEO"
    );

    if (video) {
        setCurrentVideo(video);
    }
}, [resources]);

/* Legacy manual fetch effect.
useEffect(() => {
    if (!profile) return;

    load();
}, [courseId, profile]);
*/
if (!course) {
  return (
    <div className="py-20 text-center">
      Loading...
    </div>
  );
}

if (lessonIndex===-1)
  notFound();


    async function completeLesson() {

    if (!profile) return;
    if (completed) return;

    await saveLearningProgressMutation.mutateAsync({
        student_id: profile.id,
        lesson_id: lesson.id,
        is_completed: true,
    });

    setCompleted(true);

    toast.success("Lesson completed");
}


function isCompleted(lesson: any) {
  return (
    lesson.progress?.completed ??
    lesson.completed ??
    false
  );
}

async function checkResourceAccess(
    resource: any
) {
    /*
     * Giáo viên được xem trực tiếp.
     */
    if (role !== "STUDENT") {
        return true;
    }

    /*
     * Không có exam_id
     * → resource bình thường.
     */
    if (!resource.exam_id) {
        return true;
    }

    try {
        const response = await fetch(
            `/api/student/lesson-contents/${resource.id}/access`,
            {
                method: "GET",
                credentials: "include",
            }
        );

        const result =
            await response.json();

        console.log(
            "[RESOURCE ACCESS]",
            {
                resourceId: resource.id,
                title: resource.title,
                examId: resource.exam_id,
                result,
            }
        );

        if (!response.ok) {
            toast.error(
                "Bài tập điểm danh chưa hoàn thành",
                {
                    description:
                        result.message ??
                        "Hãy làm bài tập điểm danh ngay.",
                }
            );

            return false;
        }

        if (!result.allowed) {
            toast.warning(
                "Chưa thể xem đáp án",
                {
                    description:
                        result.message ??
                        "Cần làm đề kiểm tra trước khi xem đáp án.",
                }
            );

            return false;
        }

        return true;

    } catch (error) {
        console.error(
            "[RESOURCE ACCESS ERROR]",
            error
        );

        toast.error(
            "BTDD chưa hoàn thành",
            {
                description:
                    "Hãy làm bài tập trước khi xem đáp án",
            }
        );

        return false;
    }
}


async function openResource(resource: any) {
    /*
     * Giáo viên được mở trực tiếp.
     */
    if (role !== "STUDENT") {
        window.open(
            resource.file_links?.url,
            "_blank",
            "noopener,noreferrer"
        );

        return;
    }

    /*
     * Resource không yêu cầu làm bài kiểm tra.
     */
    if (!resource.exam_id) {
        window.open(
            resource.file_links?.url,
            "_blank",
            "noopener,noreferrer"
        );

        await completeLesson();

        return;
    }

    /*
     * Resource có liên kết với exam.
     * Kiểm tra học sinh đã làm bài hay chưa.
     */
    try {
        const response = await fetch(
            `/api/student/lesson-contents/${resource.id}/access`,
            {
                method: "GET",
                credentials: "include",
            }
        );

        const result = await response.json();

        console.log(
            "[RESOURCE ACCESS]",
            {
                resourceId: resource.id,
                resourceTitle: resource.title,
                examId: resource.exam_id,
                result,
            }
        );

        if (!response.ok) {
            toast.error(
                "Không thể kiểm tra quyền truy cập",
                {
                    description:
                        result.message ??
                        "Vui lòng thử lại.",
                }
            );

            return;
        }

        /*
         * Chưa làm bài.
         */
        if (!result.allowed) {
            toast.warning(
                "Chưa thể xem đáp án",
                {
                    description:
                        result.message ??
                        "Cần làm đề kiểm tra trước khi xem đáp án.",
                }
            );

            return;
        }

        /*
         * Đã làm bài.
         */
        window.open(
            resource.file_links?.url,
            "_blank",
            "noopener,noreferrer"
        );

        await completeLesson();

    } catch (error) {
        console.error(
            "[RESOURCE ACCESS ERROR]",
            error
        );

        toast.error(
            "Có lỗi xảy ra",
            {
                description:
                    "Không thể kiểm tra quyền xem tài liệu.",
            }
        );
    }
}
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/courses/${course.id}`}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {course.name}
      </Link>
    
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-5">
          {/* Video */}
          <div className="relative aspect-video overflow-hidden rounded-xl border bg-foreground">
    {/* {firstPdf && (
  <iframe
    src={getPdfViewerUrl(firstPdf.file_links?.url)}
    className="w-full h-[700px] rounded-lg border"
  />
)} */}


{currentVideo ? (
    <>
      {console.log("Video URL:", currentVideo?.file_links?.url)}
      {console.log("Embed URL:", getYoutubeEmbedUrl(currentVideo?.file_links?.url))}
  <p className="text-white absolute top-2 left-2 z-50">
    {currentVideo?.title}
</p>

      <iframe
    key={currentVideo?.id}
    className="w-full h-full"
    src={
        currentVideo?.file_links?.url
            ? getYoutubeEmbedUrl(
                currentVideo.file_links.url
              )
            : undefined
    }
    title={currentVideo?.title}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
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
              <Play className="size-3.5"/>

              {
              resources.filter(
                  (x:any)=>x.type==="VIDEO"
              ).length
              } Video   
            <span aria-hidden>·</span>
              Bài học {lessonIndex + 1} trong {allLessons.length}
            </div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-balance">
              {lesson.title}
            </h1>
            <p className="text-muted-foreground">

              Bài học này có 

              <strong>
              {" "}
              {lesson.contents?.length ?? 0}
              {" "}
              tài liệu
              </strong>

              .

              </p>
          </div>

          {role === 'STUDENT' ? (
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
                {completed ? 'Hoàn thành' : 'Đánh dấu hoàn thành'}
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
                  onClick={()=>{

                      setSelectedResource(null);

                      setResourceDialogOpen(true);

                  }}
              >

              Add Resource

              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
  <Card>
    <CardHeader>
      <CardTitle className="text-base">
        Tài liệu
      </CardTitle>
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
            console.log(
                "[VIDEO CLICK]",
                {
                    id: resource.id,
                    title: resource.title,
                    exam_id: resource.exam_id,
                }
            );

            const allowed =
                await checkResourceAccess(
                    resource
                );

            if (!allowed) {
                return;
            }

            setCurrentVideo({
                ...resource,
            });
        }}
    >
        <Play className="h-4 w-4" />
    </Button>
) : (
    <Button
    variant="ghost"
    onClick={async () => {
        console.log(
            "[RESOURCE CLICK]",
            {
                id: resource.id,
                title: resource.title,
                exam_id: resource.exam_id,
            }
        );

        const allowed =
            await checkResourceAccess(
                resource
            );

        if (!allowed) {
            return;
        }

        const url =
            resource.file_links?.url;

        if (!url) {
            toast.error(
                "Không tìm thấy tài liệu"
            );

            return;
        }

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

        if (role === "STUDENT") {
            await completeLesson();
        }
    }}
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
              
          {/* {lesson.assignment_id ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assignment</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <ClipboardList className="size-4.5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">Practice exercise</span>
                    <span className="text-xs text-muted-foreground">
                      Complete the linked quiz to reinforce this lesson.
                    </span>
                  </div>
                </div>
                <Separator />
                <Button
                  className="w-full"
                  render={<Link href={`/exams/${lesson.assignment_id}`} />}
                >
                  {role === 'STUDENT' ? 'Start assignment' : 'View assignment'}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </CardContent>
            </Card>
          ) : null} */}

          {/* Lesson list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Khoá học này</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {allLessons.map((l: any, i: number) => (
                <Link
                  key={l.id}
                  href={`/courses/${course.id}/lessons/${l.id}`}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent',
                    l.id === lesson.id && 'bg-accent font-medium',
                  )}
                >
                  
                
                {
                  role === "STUDENT" && isCompleted(l) ? (
                    <CircleCheckBig className="size-4 shrink-0 text-primary" />
                  ) : (
                    <span className="w-4 shrink-0 text-center text-xs text-muted-foreground">
                      {i + 1}
                    </span>
                  )
                }
                  <span className="truncate">{l.title}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <ResourceDialog

open={resourceDialogOpen}

resource={selectedResource}

onClose={()=>{

setResourceDialogOpen(false);

setSelectedResource(null);

}}

onSubmit={

selectedResource

?updateResource

:createResource

}

/>

<DeleteResourceDialog

open={deleteResourceOpen}

resource={selectedResource}

onClose={()=>{

setDeleteResourceOpen(false);

setSelectedResource(null);

}}

onDelete={deleteResource}

/>
    </div>
  )
  }
