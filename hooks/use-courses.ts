import { useEffect, useState } from "react";
import { getCourses } from "@/lib/api/course";
import { Course } from "@/types/course";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourses();

        console.log("API DATA =", data);

        setCourses(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return {
    courses,
    loading,
  };
}