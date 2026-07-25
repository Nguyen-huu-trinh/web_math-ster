import Link from "next/link";

import {
  Plus,
  Pencil,
  BookOpen,
} from "lucide-react";

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

import DeleteCourseDialog from "@/components/courses/delete-course-dialog";

import { courseService } from "@/services/course.service";

export default async function CoursesManagementPage() {
  const courses =
    await courseService.getCourses();

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Courses
          </h1>

          <p className="text-muted-foreground">
            Manage all courses
          </p>

        </div>

        <Button asChild>

          <Link href="/management/courses/new">

            <Plus className="mr-2 h-4 w-4" />

            New Course

          </Link>

        </Button>

      </div>

      <Card>

        <CardHeader>

          <CardTitle>

            Course List

          </CardTitle>

        </CardHeader>

        <CardContent>

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>

                  Course

                </TableHead>

                <TableHead>

                  Status

                </TableHead>

                <TableHead>

                  Created

                </TableHead>

                <TableHead className="text-right">

                  Actions

                </TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {courses.map((course: any) => (

                <TableRow key={course.id}>

                  <TableCell>

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">

                        <BookOpen className="h-5 w-5 text-primary" />

                      </div>

                      <div>

                        <div className="font-medium">

                          {course.name}

                        </div>

                        <div className="text-sm text-muted-foreground line-clamp-1">

                          {course.description}

                        </div>

                      </div>

                    </div>

                  </TableCell>

                  <TableCell>

                    {course.is_active ? (

                      <Badge>

                        Active

                      </Badge>

                    ) : (

                      <Badge variant="secondary">

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

                    <div className="flex justify-end gap-2">

                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                      >

                        <Link
                          href={`/management/courses/${course.id}/edit`}
                        >

                          <Pencil className="mr-2 h-4 w-4" />

                          Edit

                        </Link>

                      </Button>

                      <DeleteCourseDialog
                        id={course.id}
                      />

                    </div>

                  </TableCell>

                </TableRow>

              ))}

              {courses.length === 0 && (

                <TableRow>

                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-muted-foreground"
                  >

                    No courses found

                  </TableCell>

                </TableRow>

              )}

            </TableBody>

          </Table>

        </CardContent>

      </Card>

    </div>
  );
}