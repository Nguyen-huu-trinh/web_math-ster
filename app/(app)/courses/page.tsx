"use client";

import { useEffect, useMemo, useState } from "react";

import { Search, Plus } from "lucide-react";
import type { CreateCourseDto } from "@/repositories/course.repository";
import { PageHeader } from "@/components/layout/page-header";
import { CourseCard } from "@/components/courses/course-card";
import { CourseDialog } from "@/components/courses/course-dialog";
import { DeleteCourseDialog } from "@/components/courses/delete-course-dialog";
import { CourseToolbar } from "@/components/courses/course-toolbar";
import { Button } from "@/components/ui/button";


import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

import { useAuth } from "@/providers/auth-provider";

import { courseClientService } from "@/services/course-client.service";
import type { Course } from "@/types/course";

import { toast } from "sonner";
import { UpdateCourseInput } from "@/validators/course.schema";

const CATEGORIES = [
  "All",
];

export default function CoursesPage() {

  const { profile } = useAuth();

  const role = profile?.role;

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [query, setQuery] =
    useState("");

 const filteredCourses = useMemo(() => {
  return courses.filter((course) =>
    course.name
      .toLowerCase()
      .includes(query.toLowerCase())
  );
}, [courses, query]);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {

      setLoading(true);

      const data =
        await courseClientService.getAll();

      setCourses(data);

    } catch (error) {

      console.error(error);

      toast.error("Cannot load courses");

    } finally {

      setLoading(false);

    }
  }

  async function createCourse(
    values: CreateCourseDto
  ){

    try {

      await courseClientService.create(values);

      toast.success("Course created");

      setDialogOpen(false);

      loadCourses();

    } catch {

      toast.error("Create failed");

    }

  }

  async function updateCourse(
    values: UpdateCourseInput
  ) {

    if (!selectedCourse) return;

    try {

      await courseClientService.update(
        selectedCourse.id,
        values
      );

      toast.success("Course updated");

      setDialogOpen(false);

      setSelectedCourse(null);

      loadCourses();

    } catch {

      toast.error("Update failed");

    }

  }

  async function deleteCourse() {

    if (!selectedCourse) return;

    try {

      await courseClientService.delete(
        selectedCourse.id
      );

      toast.success("Course deleted");

      setDeleteOpen(false);

      setSelectedCourse(null);

      loadCourses();

    } catch {

      toast.error("Delete failed");

    }

  }

  async function restoreCourse(
    course: Course
  ) {

    try {

      await courseClientService.restore(
        course.id
      );

      toast.success("Course restored");

      loadCourses();

    } catch {

      toast.error("Restore failed");

    }

  }

  
      return (
    <div className="flex flex-col gap-6">

      <PageHeader
        title="Khoá học"
        description={
          role === "TEACHER"
            ? "Manage your courses, chapters and lessons."
            : "Vô học bớt lười đi."
        }
      //   action={
      //     role === "TEACHER" ? (
      //       <Button
      //         onClick={() => {
      //           setSelectedCourse(null);
      //           setDialogOpen(true);
      //         }}
      //       >
      //         <Plus data-icon="inline-start" />
      //         New course
      //       </Button>
      //     ) : undefined
      //   }
      />
          <CourseToolbar
            keyword={query}
            onKeywordChange={setQuery}
        >
            {role === "TEACHER" && (
                <Button
                    onClick={() => {
                        setSelectedCourse(null);
                        setDialogOpen(true);
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Course
                </Button>
            )}
        </CourseToolbar>

        

      {loading ? (

        <div className="py-20 text-center">

          Đang tải...

        </div>

      ) : filteredCourses.length === 0 ? (

        <Empty>

          <EmptyHeader>

            <EmptyTitle>

              No courses found

            </EmptyTitle>

            <EmptyDescription>

              There are no courses.

            </EmptyDescription>

          </EmptyHeader>

        </Empty>

      ) : (

        <div
  className="
    grid
    grid-cols-1
    gap-4
    sm:grid-cols-2
    md:grid-cols-3
    xl:grid-cols-4
    2xl:grid-cols-4
  "
>

          {filteredCourses.map((course) => (

            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => {
                  setSelectedCourse(course);
                  setDialogOpen(true);
              }}
              onDelete={() => {
                  setSelectedCourse(course);
                  setDeleteOpen(true);
              }}
          />

          ))}

        </div>

      )}
            <CourseDialog
        open={dialogOpen}
        course={selectedCourse}
        onClose={() => {
          setDialogOpen(false);
          setSelectedCourse(null);
        }}
        onSubmit={
          selectedCourse
            ? updateCourse
            : createCourse
        }
      />

      <DeleteCourseDialog
        open={deleteOpen}
        course={selectedCourse}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedCourse(null);
        }}
        onDelete={deleteCourse}
      />

    </div>
  );
}