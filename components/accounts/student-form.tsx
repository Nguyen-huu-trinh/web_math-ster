"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Checkbox,
} from "@/components/ui/checkbox";

import {
  ScrollArea,
} from "@/components/ui/scroll-area";

export interface CourseItem {
  id: string;
  name: string;
}

interface Props {
  courses: CourseItem[];

  loading?: boolean;

  onSubmit: (data: {
    student_code: string;
    full_name: string;
    personal_email: string;
    course_ids: string[];
  }) => Promise<void>;
}

export default function StudentForm({
  courses,
  loading,
  onSubmit,
}: Props) {

  const [studentCode, setStudentCode] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [personalEmail, setPersonalEmail] =
    useState("");

  const [selectedCourses, setSelectedCourses] =
    useState<string[]>([]);

  const toggleCourse = (id: string) => {

    setSelectedCourses((old) =>

      old.includes(id)
        ? old.filter((x) => x !== id)
        : [...old, id]

    );

  };

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    await onSubmit({

      student_code: studentCode.trim(),

      full_name: fullName.trim(),

      personal_email: personalEmail.trim(),

      course_ids: selectedCourses,

    });

    setStudentCode("");

    setFullName("");

    setPersonalEmail("");

    setSelectedCourses([]);

  }

  return (

    <Card>

      <CardHeader>

        <CardTitle>

          Tạo học sinh

        </CardTitle>

      </CardHeader>

      <CardContent>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <div className="space-y-2">

            <Label>

              Mã học sinh

            </Label>

            <Input
              value={studentCode}
              onChange={(e) =>
                setStudentCode(
                  e.target.value
                )
              }
              placeholder="VD: HS0001"
              required
            />

          </div>

          <div className="space-y-2">

            <Label>

              Họ tên

            </Label>

            <Input
              value={fullName}
              onChange={(e) =>
                setFullName(
                  e.target.value
                )
              }
              required
            />

          </div>

          <div className="space-y-2">

            <Label>

              Email cá nhân

            </Label>

            <Input
              type="email"
              value={personalEmail}
              onChange={(e) =>
                setPersonalEmail(
                  e.target.value
                )
              }
              placeholder="abc@gmail.com"
            />

          </div>

          <div className="space-y-3">

            <Label>

              Khóa học

            </Label>

            <ScrollArea className="h-60 rounded-md border p-3">

              <div className="space-y-3">

                {courses.map((course) => (

                  <div
                    key={course.id}
                    className="flex items-center gap-3"
                  >

                    <Checkbox
                      checked={selectedCourses.includes(
                        course.id
                      )}
                      onCheckedChange={() =>
                        toggleCourse(
                          course.id
                        )
                      }
                    />

                    <span>

                      {course.name}

                    </span>

                  </div>

                ))}

              </div>

            </ScrollArea>

          </div>

          <Button
            className="w-full"
            disabled={loading}
          >

            {loading
              ? "Đang tạo..."
              : "Tạo học sinh"}

          </Button>

        </form>

      </CardContent>

    </Card>

  );

}