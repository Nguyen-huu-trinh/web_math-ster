export function notificationLink(item: { type: string; link: string | null }): string {
  const link = item.link || "/dashboard";
  if (!link.startsWith("/") || link.startsWith("//") || /[\\\u0000-\u0020]/.test(link)) {
    return "/dashboard";
  }

  if (item.type === "ANNOUNCEMENT") return link;

  // Older material broadcasts point to the course list instead of the player.
  const url = new URL(link, "https://math-ster.local");
  if (item.type === "LESSON_MATERIAL" && url.pathname === "/courses") {
    const courseId = url.searchParams.get("courseId");
    const lessonId = url.searchParams.get("lessonId");
    if (courseId && lessonId) {
      return `/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}`;
    }
  }
  return link;
}
