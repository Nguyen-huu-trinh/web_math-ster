import { createClient } from "@/lib/supabase/server";

import {
  AnswerKey,
  CreateExamDto,
  QuestionConfig,
  UpdateExamDto,
} from "@/types/exam";

export class ExamRepository {

  // =========================================================
  // GET ALL
  // =========================================================

  async getAll() {

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exams")
      .select(`
        *,
        courses(
          id,
          name
        )
      `)
      .is("deleted_at", null)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  }

  // =========================================================
  // GET BY ID
  // =========================================================

  async getById(id: string) {

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) throw error;

    return data;
  }

  // =========================================================
  // GET ANSWER KEY
  // =========================================================

  async getAnswerKey(id: string) {

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exams")
      .select("answer_key")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data.answer_key;
  }

  // =========================================================
  // CREATE
  // =========================================================

  async create(
    teacherId: string,
    values: CreateExamDto
  ) {

    const supabase = await createClient();

    let questionConfig: QuestionConfig;

    if (values.exam_type === "MOET")  {

      questionConfig = {

        multipleChoice: 12,

        trueFalse: 4,

        shortAnswer: 6,

      };

    } else {

      questionConfig = values.question_config;

    }

    const emptyAnswerKey: AnswerKey = {

      multipleChoice: Array(
        questionConfig.multipleChoice
      ).fill(""),

      trueFalse: Array.from(
        {
          length: questionConfig.trueFalse,
        },
        () => ["", "", "", ""]
      ),

      shortAnswer: Array(
        questionConfig.shortAnswer
      ).fill(""),

    };

    const { data, error } = await supabase
      .from("exams")
      .insert({

        title: values.title,

        description: values.description,

        course_id: values.course_id,

        exam_file_url: values.exam_file_url,

        exam_type: values.exam_type,

        category: values.category,

        duration_minutes:
          values.duration_minutes,

        attendance_min_score:
          values.attendance_min_score,

        show_answer:
          values.show_answer,

        max_attempts:
          values.max_attempts,

        start_at:
          values.start_at,

        end_at:
          values.end_at,

        question_config:
          questionConfig,

        answer_key:
          emptyAnswerKey,

       status: "LOCKED",
        is_active: true,

        created_by: teacherId,

      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // =========================================================
  // UPDATE
  // =========================================================

async update(
  id: string,
  values: UpdateExamDto
) {
  const supabase = await createClient();

  // Loại bỏ các field không tồn tại trong bảng exams
  const {
    teacherId,
    ...updateData
  } = values as any;

  const { data, error } = await supabase
    .from("exams")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

  // =========================================================
  // UPDATE ANSWER KEY
  // =========================================================

  async updateAnswerKey(
    id: string,
    answerKey: AnswerKey
  ) {

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exams")
      .update({

        answer_key: answerKey,

      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // =========================================================
  // ACTIVATE
  // =========================================================

  async activate(id: string) {

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exams")
      .update({

        is_active: true,

        status: "OPEN",

      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // =========================================================
  // DEACTIVATE
  // =========================================================

  async deactivate(id: string) {

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exams")
      .update({

        is_active: false,

        status: "LOCKED",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // =========================================================
  // DUPLICATE
  // =========================================================

  async duplicate(
    id: string,
    teacherId: string
  ) {

    const exam = await this.getById(id);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exams")
      .insert({

        title: exam.title + " (Copy)",

        description: exam.description,

        course_id: exam.course_id,

        exam_file_url: exam.exam_file_url,

        exam_type: exam.exam_type,

        category: exam.category,

        duration_minutes:
          exam.duration_minutes,

        attendance_min_score:
          exam.attendance_min_score,

        show_answer:
          exam.show_answer,

        max_attempts:
          exam.max_attempts,

        start_at:
          exam.start_at,

        end_at:
          exam.end_at,

        question_config:
          exam.question_config,

        answer_key:
          exam.answer_key,

        created_by: teacherId,

        status: "LOCKED",

        is_active: true,

      })
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  // =========================================================
  // SOFT DELETE
  // =========================================================

  async softDelete(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("exams")
        .delete()
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return data;
}

}

export const examRepository =
  new ExamRepository();