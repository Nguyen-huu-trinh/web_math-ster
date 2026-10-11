import { createClient } from "@/lib/supabase/server";

// Only use for idempotent operations such as the conditional attempt save.
// Do not wrap adjust_student_points: its existing RPC is not idempotent.
export async function withSubmitRetry<T>(
  operation: (client: Awaited<ReturnType<typeof createClient>>) => PromiseLike<T & {
    error: { message: string; code?: string } | null;
    status?: number;
  }>,
): Promise<T> {
  const client = await createClient();
  for (let attempt = 0; ; attempt++) {
    try {
      const { error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      const result = await operation(client);
      if (!result.error) return result;
      throw Object.assign(new Error(result.error.message), {
        status: result.status, code: result.error.code,
      });
    } catch (error) {
      const e = error as { status?: number; code?: string; message?: string; name?: string };
      const authError = e.status === 401 || e.code === "PGRST301" || e.code === "PGRST303" ||
        /JWT.*expired|invalid.*session|session.*invalid/i.test(e.message ?? "");
      const transient = authError || e.status === 408 || e.status === 429 || (e.status ?? 0) >= 500 ||
        e.name === "TypeError" || e.name === "AbortError" || e.name === "TimeoutError" ||
        /fetch|network|timeout|abort/i.test(e.message ?? "");
      if (attempt >= 2 || !transient) throw error;
      if (authError) {
        const { error: refreshError } = await client.auth.refreshSession();
        if (refreshError) throw refreshError;
      }
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
}
