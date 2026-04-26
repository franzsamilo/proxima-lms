export type FileKind = "pdf" | "docx" | "pptx" | "xlsx" | "image" | "video" | "audio" | "text" | "code" | "csv" | "archive" | "other"

const EXT_TO_KIND: Record<string, FileKind> = {
  pdf: "pdf",
  doc: "docx", docx: "docx", odt: "docx", rtf: "docx",
  ppt: "pptx", pptx: "pptx", odp: "pptx", key: "pptx",
  xls: "xlsx", xlsx: "xlsx", ods: "xlsx",
  csv: "csv", tsv: "csv",
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", svg: "image", bmp: "image", avif: "image",
  mp4: "video", mov: "video", webm: "video", mkv: "video", m4v: "video",
  mp3: "audio", wav: "audio", flac: "audio", ogg: "audio", m4a: "audio",
  txt: "text", md: "text", markdown: "text", log: "text",
  py: "code", js: "code", ts: "code", tsx: "code", jsx: "code", c: "code", cpp: "code", h: "code", hpp: "code", java: "code", rs: "code", go: "code", json: "code", yml: "code", yaml: "code", html: "code", css: "code", sh: "code",
  zip: "archive", tar: "archive", gz: "archive", "7z": "archive", rar: "archive",
}

const MIME_TO_KIND: Record<string, FileKind> = {
  "application/pdf": "pdf",
  "application/msword": "docx",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-powerpoint": "pptx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.ms-excel": "xlsx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/csv": "csv",
  "text/plain": "text",
  "text/markdown": "text",
}

export function detectFileKind(input: { mime?: string | null; name?: string | null }): FileKind {
  if (input.mime) {
    if (MIME_TO_KIND[input.mime]) return MIME_TO_KIND[input.mime]
    if (input.mime.startsWith("image/")) return "image"
    if (input.mime.startsWith("video/")) return "video"
    if (input.mime.startsWith("audio/")) return "audio"
    if (input.mime.startsWith("text/")) return "text"
  }
  if (input.name) {
    const ext = input.name.split(".").pop()?.toLowerCase()
    if (ext && EXT_TO_KIND[ext]) return EXT_TO_KIND[ext]
  }
  return "other"
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "—"
  const units = ["B", "KB", "MB", "GB"]
  let n = bytes
  let i = 0
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

export const KIND_LABEL: Record<FileKind, string> = {
  pdf: "PDF DOCUMENT",
  docx: "WORD DOCUMENT",
  pptx: "PRESENTATION",
  xlsx: "SPREADSHEET",
  image: "IMAGE",
  video: "VIDEO",
  audio: "AUDIO",
  text: "TEXT",
  code: "SOURCE CODE",
  csv: "TABULAR DATA",
  archive: "ARCHIVE",
  other: "FILE",
}
