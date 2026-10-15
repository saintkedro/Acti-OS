const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

export type VideoEmbed =
  | { kind: "none" }
  | { kind: "iframe"; src: string }
  | { kind: "file"; src: string }
  | { kind: "invalid" };

function youtubeId(url: URL) {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    return url.pathname.split("/").filter(Boolean)[0] ?? "";
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/")) {
      return url.pathname.split("/")[2] ?? "";
    }
    return url.searchParams.get("v") ?? "";
  }
  return "";
}

/** Allow only known video hosts and direct https media files. */
export function videoEmbed(raw: string | null | undefined): VideoEmbed {
  if (!raw?.trim()) return { kind: "none" };

  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { kind: "invalid" };
  }

  if (url.protocol !== "https:") return { kind: "invalid" };

  const host = url.hostname.replace(/^www\./, "");
  const yt = youtubeId(url);
  if (yt) {
    if (!YOUTUBE_ID.test(yt)) return { kind: "invalid" };
    return {
      kind: "iframe",
      src: `https://www.youtube-nocookie.com/embed/${yt}`,
    };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).pop() ?? "";
    if (!/^\d+$/.test(id)) return { kind: "invalid" };
    return { kind: "iframe", src: `https://player.vimeo.com/video/${id}` };
  }

  if (/\.(mp4|webm)$/i.test(url.pathname)) {
    return { kind: "file", src: url.toString() };
  }

  return { kind: "invalid" };
}

export function safeHttpsUrl(raw: string | null | undefined) {
  if (!raw?.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function captionTrack(raw: string | null | undefined) {
  if (!raw?.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return null;
    if (!url.pathname.toLowerCase().endsWith(".vtt")) return null;
    return url.toString();
  } catch {
    return null;
  }
}
