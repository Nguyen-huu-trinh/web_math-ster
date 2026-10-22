// Do not serialize request bodies, response rows, tokens, or stack traces.
export function summarizeLogError(...values: unknown[]) {
  return values.slice(0, 5).map(value => {
    if (typeof value === "string") return value.slice(0, 300);
    if (!value || typeof value !== "object") return value;
    const record = value as Record<string, unknown>;
    const summary: Record<string, string | number> = {};
    for (const key of ["name", "message", "code", "status"]) {
      const field = record[key];
      if (typeof field === "string") summary[key] = field.slice(0, 300);
      else if (typeof field === "number") summary[key] = field;
    }
    return summary;
  });
}

export function logServerError(...values: unknown[]) {
  console.error(...summarizeLogError(...values));
}
