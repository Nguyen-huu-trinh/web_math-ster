export function tutoringTemplateRows(today: string): string[][] {
  const rows = [["slot_date", "start_time", "end_time", "note"]];
  const start = Date.parse(`${today}T00:00:00Z`);
  for (let day = 1; day <= 3; day++) {
    const date = new Date(start + day * 86400000).toISOString().slice(0, 10);
    for (const [from, to] of [["20:00", "20:30"], ["20:30", "21:00"], ["21:00", "21:30"], ["21:30", "22:00"]]) {
      rows.push([date, from, to, ""]);
    }
  }
  return rows;
}
