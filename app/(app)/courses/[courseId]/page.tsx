import CourseClientView from "./course-client-view";

// Cache tĩnh trên CDN trong 2 giờ (7200 giây)
export const revalidate = 7200;

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params;

  return <CourseClientView courseId={courseId} />;
}