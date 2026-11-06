export const TUTORING_CANCELLATION_MESSAGE =
  "Không được hủy đăng ký khi còn 7 ngày hoặc ít hơn đến giờ bổ trợ.";

export function isTutoringCancellationLocked(
  slot: { slot_date: string; start_time: string },
  now = Date.now()
): boolean {
  const startsAt = Date.parse(`${slot.slot_date}T${slot.start_time}+07:00`);
  return !Number.isFinite(startsAt) || startsAt - now <= 7 * 24 * 60 * 60 * 1000;
}
