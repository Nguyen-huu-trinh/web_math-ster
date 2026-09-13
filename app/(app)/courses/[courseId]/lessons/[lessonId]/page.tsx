import LessonClientView from "./lesson-client-view";

// Revalidate trang theo cơ chế ISR (2 giờ)
export const revalidate = 7200;

interface LessonPageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseId, lessonId } = await params;

  return <LessonClientView courseId={courseId} lessonId={lessonId} />;
}