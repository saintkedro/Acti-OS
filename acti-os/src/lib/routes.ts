/** Relative in-app path only. Rejects protocol-relative and external URLs. */
export function safeInternalPath(value: string | null | undefined) {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }
  if (value.includes("://")) return null;
  return value;
}
