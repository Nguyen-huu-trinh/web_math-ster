const API = "/api";

export async function getCourses() {
  const res = await fetch(`${API}/courses`, {
    cache: "no-store",
  });

  console.log("STATUS =", res.status);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}

export async function getCourseDetail(
  courseId: string
) {
  const res = await fetch(
    `${API}/courses/${courseId}/detail`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Cannot load course");
  }

  return res.json();
}

export async function getLesson(
  lessonId: string
) {
  const res = await fetch(
    `${API}/lessons/${lessonId}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Cannot load lesson");
  }

  return res.json();
}

export async function getLessonDocuments(
  lessonId: string
) {
  const res = await fetch(
    `/api/documents?lessonId=${lessonId}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Cannot load documents");
  }

  return res.json();
}

export async function getLearningProgress(
  studentId: string
) {
  const res = await fetch(
    `/api/learning-progress?studentId=${studentId}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Cannot load progress");
  }

  return res.json();
}