export const RESOURCE_TYPES = [
  "VIDEO",
  "PDF",
  "EXAM",
] as const;

export const RESOURCE_PROVIDERS = [
  "youtube",
  "google_drive",
  "onedrive",
  "dropbox",
  "vimeo",
  "pdf",
  "word",
  "powerpoint",
  "excel",
  "canva",
  "other",
] as const;

export type ResourceType =
  (typeof RESOURCE_TYPES)[number];

export type ResourceProvider =
  (typeof RESOURCE_PROVIDERS)[number];

export const PROVIDER_LABELS = {
  youtube: "YouTube",
  google_drive: "Google Drive",
  onedrive: "OneDrive",
  dropbox: "Dropbox",
  vimeo: "Vimeo",
  pdf: "PDF",
  word: "Word",
  powerpoint: "PowerPoint",
  excel: "Excel",
  canva: "Canva",
  other: "Other",
};