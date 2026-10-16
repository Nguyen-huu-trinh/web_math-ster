export function getAvatarUrl(url?: string | null) {
  return getStudentAvatarUrl(url) ?? "/placeholder.svg";
}

/** Normalize stored links without changing the profile's original avatar URL. */
export function getStudentAvatarUrl(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  try {
    const url = new URL(trimmed);
    if (url.hostname !== "drive.google.com" && url.hostname !== "www.drive.google.com") {
      return trimmed;
    }

    const fileId = url.pathname.match(/\/file\/(?:u\/\d+\/)?d\/([^/]+)/)?.[1]
      ?? url.searchParams.get("id");
    if (!fileId) return trimmed;

    const thumbnail = new URL("https://drive.google.com/thumbnail");
    thumbnail.searchParams.set("id", fileId);
    thumbnail.searchParams.set("sz", "w512");
    const resourceKey = url.searchParams.get("resourcekey");
    if (resourceKey) thumbnail.searchParams.set("resourcekey", resourceKey);
    return thumbnail.toString();
  } catch {
    return trimmed;
  }
}
