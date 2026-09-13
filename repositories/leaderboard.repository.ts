import { createClient } from "@/lib/supabase/server";

export class LeaderboardRepository {

  async getDashboardData() {
    const supabase = await createClient();

    // Dùng chung 1 instance supabase client cho 8 query song song
    const [
      overall,
      latest,
      lazy,
      lowHomework,
      hardworking,
      excellent,
      rewardMoney,
      dotrau,
    ] = await Promise.all([
      supabase.from("v_leaderboard").select("*").order("average_score", { ascending: false }).limit(10),
      supabase.from("v_latest_exam_leaderboard").select("*").order("ranking").limit(10),
      supabase.from("v_lazy_students").select("*").limit(5),
      supabase.from("v_low_homework_students").select("*").limit(5),
      supabase.from("v_hardworking_students").select("*").limit(5),
      supabase.from("v_excellent_students").select("student_id, student_code, full_name, avatar_url, count").limit(8),
      supabase.from("v_reward_money_students").select("*").limit(5),
      supabase.from("v_dotrau_students").select("*").limit(5),
    ]);

    // Kiểm tra và bắt lỗi tập trung
    if (overall.error) throw overall.error;
    if (latest.error) throw latest.error;
    if (lazy.error) throw lazy.error;
    if (lowHomework.error) throw lowHomework.error;
    if (hardworking.error) throw hardworking.error;
    if (excellent.error) throw excellent.error;
    if (rewardMoney.error) throw rewardMoney.error;
    if (dotrau.error) throw dotrau.error;

    return {
      overall: overall.data,
      latest: latest.data,
      lazy: lazy.data,
      lowHomework: lowHomework.data,
      hardworking: hardworking.data,
      excellent: excellent.data,
      rewardMoney: rewardMoney.data,
      dotrau: dotrau.data,
    };
  }

  // Giữ lại các hàm đơn lẻ nếu cần dùng ở nơi khác
  async overall() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_leaderboard").select("*").order("average_score", { ascending: false }).limit(10);
    if (error) throw error;
    return data;
  }

  async latest() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_latest_exam_leaderboard").select("*").order("ranking").limit(10);
    if (error) throw error;
    return data;
  }

  async lazyStudents() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_lazy_students").select("*").limit(5);
    if (error) throw error;
    return data;
  }

  async lowHomeworkStudents() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_low_homework_students").select("*").limit(5);
    if (error) throw error;
    return data;
  }

  async hardworkingStudents() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_hardworking_students").select("*").limit(5);
    if (error) throw error;
    return data;
  }

  async excellentStudents() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_excellent_students").select("student_id, student_code, full_name, avatar_url, count").limit(8);
    if (error) throw error;
    return data;
  }

  async rewardMoneyStudents() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_reward_money_students").select("*").limit(5);
    if (error) throw error;
    return data;
  }

  async doTrauStudents() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("v_dotrau_students").select("*").limit(5);
    if (error) throw error;
    return data;
  }
}

export const leaderboardRepository = new LeaderboardRepository();