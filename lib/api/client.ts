class ApiClient {
  private async request<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(url, {
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
      ...options,
    });

    if (!response.ok) {
      let message =
        `Request failed with status ${response.status}`;

      let code: string | undefined;

      try {
        const data = await response.json();

        message =
          data?.error ??
          data?.message ??
          message;

        code = data?.code;
      } catch {
        // Response không phải JSON
      }

      const error = new Error(message) as Error & {
        status?: number;
        code?: string;
      };

      error.status = response.status;
      error.code = code;

      throw error;
    }

    return response.json() as Promise<T>;
  }

  get<T>(url: string): Promise<T> {
    return this.request<T>(url);
  }

  post<T>(
    url: string,
    body?: unknown
  ): Promise<T> {
    return this.request<T>(url, {
      method: "POST",
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    });
  }

  put<T>(
    url: string,
    body?: unknown
  ): Promise<T> {
    return this.request<T>(url, {
      method: "PUT",
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    });
  }

  patch<T>(
    url: string,
    body?: unknown
  ): Promise<T> {
    return this.request<T>(url, {
      method: "PATCH",
      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    });
  }

delete<T>(
    url: string,
    body?: unknown
): Promise<T> {
    return this.request<T>(url, {
        method: "DELETE",
        body:
            body !== undefined
                ? JSON.stringify(body)
                : undefined,
    });
}
}

export const apiClient = new ApiClient();