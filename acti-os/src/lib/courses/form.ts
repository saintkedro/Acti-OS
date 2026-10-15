const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isUuid(value: string) {
  return UUID_RE.test(value);
}

export function isSlug(value: string) {
  return SLUG_RE.test(value);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function codeify(value: string) {
  return value
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);
}

export function readText(formData: FormData, key: string, max: number) {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function readRequired(formData: FormData, key: string, max: number, label: string) {
  const value = readText(formData, key, max + 1);
  if (!value) return { error: `${label} is required.` as const, value: "" };
  if (value.length > max) return { error: `${label} is too long.` as const, value: "" };
  return { error: null, value };
}

export function readKobo(raw: string) {
  const value = raw.trim();
  if (!value) return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const kobo = Math.round(Number(value) * 100);
  if (!Number.isSafeInteger(kobo) || kobo < 0 || kobo > 100_000_000_00) return null;
  return kobo;
}

export function readQueryMessage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  return raw.replace(/\s+/g, " ").slice(0, 240);
}

export function queryError(path: string, message: string) {
  return `${path}?error=${encodeURIComponent(message)}`;
}
