import { z } from "zod";

const time = z.string().trim()
  .regex(/^(\d|[01]\d|2[0-3]):[0-5]\d$/, "Giờ phải có dạng H:mm hoặc HH:mm (ví dụ 1:00 hoặc 01:00).")
  .transform(value => value.padStart(5, "0"));
export const tutoringInput = z.object({
  slot_date: z.iso.date("Ngày phải có dạng YYYY-MM-DD."),
  start_time: time,
  end_time: z.union([time, z.literal("")]).transform(v => v || null),
  note: z.string().trim().max(2000).default(""),
}).refine(v => !v.end_time || v.end_time > v.start_time, { message: "Giờ kết thúc phải sau giờ bắt đầu." });

export const tutoringBatch = z.array(tutoringInput).min(1).max(500).superRefine((rows, ctx) => {
  const seen = new Set<string>();
  rows.forEach((row, index) => {
    const key = `${row.slot_date} ${row.start_time}`;
    if (seen.has(key)) ctx.addIssue({ code: "custom", path: [index], message: "Trùng ngày và giờ trong tệp." });
    seen.add(key);
  });
});

export type ImportRow = { slot_date: string; start_time: string; end_time: string; note: string };

export function normalizeImportRows(rows: unknown[][], parseSerial: (value: number) => { y: number; m: number; d: number } | null): ImportRow[] {
  if (rows.length < 2 || rows.length > 501) throw new Error("Tệp phải có từ 1 đến 500 dòng dữ liệu.");
  const header = rows[0].map(v => String(v ?? "").trim().toLowerCase());
  for (const key of ["slot_date", "start_time"]) if (!header.includes(key)) throw new Error(`Thiếu cột ${key}.`);
  function date(value: unknown) {
    if (typeof value === "number") {
      const d = parseSerial(value);
      if (!d) return "";
      return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
    }
    const s = String(value ?? "").trim();
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : s;
  }
  function clock(value: unknown) {
    if (typeof value !== "number") return String(value ?? "").trim();
    if (value < 0 || value >= 1) return "invalid";
    const minutes = Math.round(value * 1440);
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  }
  return rows.slice(1).map((row, index) => {
    const get = (key: string) => row[header.indexOf(key)];
    const input = { slot_date: date(get("slot_date")), start_time: clock(get("start_time")), end_time: clock(get("end_time")), note: String(get("note") ?? "") };
    const result = tutoringInput.safeParse(input);
    if (!result.success) throw new Error(`Dòng ${index + 2}: ${result.error.issues[0].message}`);
    return { ...result.data, end_time: result.data.end_time ?? "" };
  });
}
