export function getAvatarUrl(url?: string | null) {
  if (!url) {
    return "/placeholder.svg";
  }

  // Link Google Drive dạng:
  // https://drive.google.com/file/d/FILE_ID/view
  const match = url.match(/\/file\/d\/([^/]+)/);

  if (match) {
    const fileId = match[1];

    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w512`;
  }

  // Nếu đã là URL ảnh khác thì giữ nguyên
  return url;
}