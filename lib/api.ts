export async function api<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const error = await response.json();
      message = error.message ?? message;
    } catch {}

    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}