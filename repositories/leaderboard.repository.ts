import { createClient } from "@/lib/supabase/server";

export class LeaderboardRepository {

  async overall() {

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("v_leaderboard")
      .select("*")
      .order("average_score", {
        ascending: false,
      })
      .limit(10);

    if (error) throw error;

    return data;
  }

  async latest() {

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("v_latest_exam_leaderboard")
      .select("*")
      .order("ranking")
      .limit(10);

    if (error) throw error;

    return data;
  }

  async lazyStudents() {

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("v_lazy_students")
      .select("*")
      .limit(5);

    if (error) throw error;

    return data;
  }

  async lowHomeworkStudents() {

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("v_low_homework_students")
      .select("*")
      .limit(5);

    if (error) throw error;

    return data;
  }

  async hardworkingStudents() {

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("v_hardworking_students")
      .select("*")
      .limit(5);

    if (error) throw error;

    return data;
  }

  async excellentStudents() {

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("v_excellent_students")
      .select("*")
      .limit(5);

    if (error) throw error;

    return data;
  }

}

export const leaderboardRepository =
  new LeaderboardRepository();