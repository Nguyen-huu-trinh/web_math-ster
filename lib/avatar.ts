export function getAvatarUrl(
  url?: string | null
) {
  if (!url) {
    return "/placeholder.svg";
  }

  const match =
    url.match(
      /\/file\/d\/([^/]+)/
    );

  if (!match) {
    return url;
  }

  return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w512`;
}