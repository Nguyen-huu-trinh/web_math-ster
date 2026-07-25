class ProfileClientService {
  async getMe() {
    const res = await fetch("/api/profile/me", {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load profile");
    }

    return res.json();
  }

  async update(values: {
    full_name?: string;
    phone?: string | null;
    avatar_url?: string | null;
  }) {
    const res = await fetch("/api/profile/me", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      throw new Error("Failed to update profile");
    }

    return res.json();
  }
}

export const profileClientService =
  new ProfileClientService();