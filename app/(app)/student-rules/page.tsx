import StudentRulesContent from "./student-rules-content";

// Revalidate mỗi 24 giờ (hoặc tùy chọn) để tận dụng CDN Caching
export const revalidate = 86400;

export default function StudentRulesPage() {
  return <StudentRulesContent />;
}