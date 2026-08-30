import { requireProfile } from "@/lib/auth/require-profile";
import StudentRulesContent from "./student-rules-content";

export default async function StudentRulesPage() {
  const profile =
    await requireProfile();

  return (
    <StudentRulesContent
      role={profile.role}
    />
  );
}