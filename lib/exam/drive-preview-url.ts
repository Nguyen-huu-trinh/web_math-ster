/** Normalize Drive file sharing links for the embedded exam viewer. */
export function toDrivePreviewUrl(value: string): string {
  const input = value.trim();
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return input;
  }

  if (!['https:', 'http:'].includes(url.protocol) ||
      !['drive.google.com', 'www.drive.google.com'].includes(url.hostname)) {
    return input;
  }

  const fileId = url.pathname.match(/^\/file\/(?:u\/\d+\/)?d\/([\w-]+)(?:\/|$)/)?.[1]
    ?? (['/open', '/uc'].includes(url.pathname) ? url.searchParams.get('id') : null);
  if (!fileId || !/^[\w-]+$/.test(fileId)) return input;

  const preview = new URL(`https://drive.google.com/file/d/${fileId}/preview`);
  const resourceKey = url.searchParams.get('resourcekey');
  if (resourceKey) preview.searchParams.set('resourcekey', resourceKey);
  return preview.toString();
}
