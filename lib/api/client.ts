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

      let message = "Something went wrong";

      try {

        const error = await response.json();

        message = error.message ?? message;

      } catch {}

      throw new Error(message);

    }

    return response.json();

  }

  get<T>(url: string) {

    return this.request<T>(url);

  }

  post<T>(
    url: string,
    body?: unknown
  ) {

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
  ) {

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
  ) {

    return this.request<T>(url, {

      method: "PATCH",

      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,

    });

  }

  delete<T>(url: string) {

    return this.request<T>(url, {

      method: "DELETE",

    });

  }

}

export const apiClient =
  new ApiClient();