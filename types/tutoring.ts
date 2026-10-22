export type TutoringSlot = {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string | null;
  month_key: string;
  student_id: string | null;
  booked_at: string | null;
  is_active: boolean;
  note: string | null;
  is_booked: boolean;
  student_name: string | null;
  student_code?: string | null;
};
