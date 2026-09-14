import CourseClientView from "./course-client-view";


interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params;

  return <CourseClientView courseId={courseId} />;
}