"use client";

import { useState } from "react";

import Image from "next/image";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import { CourseDialog } from "./course-dialog";
import { CourseActions } from "./course-actions";

import { courseService } from "@/services/course.service";

import { toast } from "sonner";

interface Props {
  courses: any[];
  refresh: () => Promise<void>;
}

export function CourseTable({
  courses,
  refresh,
}: Props) {
  const [open, setOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<any>(null);

  async function createCourse(
    values: any
  ) {
    await courseService.createCourse(
      values
    );

    toast.success(
      "Course created"
    );

    await refresh();
  }

  async function updateCourse(
    values: any
  ) {
    await courseService.updateCourse(
      editing.id,
      values
    );

    toast.success(
      "Course updated"
    );

    setEditing(null);

    await refresh();
  }

  async function deleteCourse(
    id: string
  ) {
    if (
      !confirm(
        "Delete this course?"
      )
    ) {
      return;
    }

    await courseService.deleteCourse(
      id
    );

    toast.success(
      "Course deleted"
    );

    await refresh();
  }

  return (
    <Card>

      <CardHeader className="flex flex-row items-center justify-between">

        <CardTitle>

          Courses

        </CardTitle>

        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>

      </CardHeader>

      <CardContent>

        <Table>

          <TableHeader>

            <TableRow>

              <TableHead>

                Thumbnail

              </TableHead>

              <TableHead>

                Course

              </TableHead>

              <TableHead>

                Status

              </TableHead>

              <TableHead>

                Created

              </TableHead>

              <TableHead className="w-20" />

            </TableRow>

          </TableHeader>

          <TableBody>

            {courses.map(
              (course) => (

                <TableRow
                  key={course.id}
                >

                  <TableCell>

                    <Image
                      src={
                        course.thumbnail_url ||
                        "/placeholder.svg"
                      }
                      alt={course.name}
                      width={80}
                      height={50}
                      className="rounded-md object-cover"
                    />

                  </TableCell>

                  <TableCell>

                    <div>

                      <div className="font-medium">

                        {course.name}

                      </div>

                      <div className="text-sm text-muted-foreground line-clamp-1">

                        {course.description}

                      </div>

                    </div>

                  </TableCell>

                  <TableCell>

                    {course.is_active ? (

                      <Badge>

                        Active

                      </Badge>

                    ) : (

                      <Badge
                        variant="secondary"
                      >

                        Disabled

                      </Badge>

                    )}

                  </TableCell>

                  <TableCell>

                    {new Date(
                      course.created_at
                    ).toLocaleDateString()}

                  </TableCell>

                  <TableCell>

                    <CourseActions
                      onEdit={() => {
                        setEditing(
                          course
                        );

                        setOpen(
                          true
                        );
                      }}
                      onDelete={() =>
                        deleteCourse(
                          course.id
                        )
                      }
                    />

                  </TableCell>

                </TableRow>

              )
            )}

          </TableBody>

        </Table>

      </CardContent>

      <CourseDialog
        open={open}
        onOpenChange={setOpen}
        course={editing}
        onSuccess={refresh}
      />

    </Card>
  );
}