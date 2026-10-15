import { captionTrack, videoEmbed } from "@/lib/courses/video";
import type { LessonType } from "@/lib/courses/types";
import { showsVideoSlot } from "@/lib/courses/labels";

export function LessonVideo({
  title,
  videoUrl,
  captionUrl,
  lessonType,
}: {
  title: string;
  videoUrl: string | null;
  captionUrl: string | null;
  lessonType: LessonType;
}) {
  if (!showsVideoSlot(lessonType)) return null;

  const embed = videoEmbed(videoUrl);
  const captions = captionTrack(captionUrl);

  if (embed.kind === "none") {
    return (
      <p
        role="status"
        className="rounded-xl border border-dashed bg-secondary/40 px-4 py-3 text-sm leading-6 text-muted-foreground"
      >
        {lessonType === "text_video" || lessonType === "practical"
          ? "A recording has not been linked yet. The written lesson is enough to continue."
          : "The recording for this lesson has not been linked yet."}
      </p>
    );
  }

  if (embed.kind === "invalid") {
    return (
      <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        This video link cannot be played. Use a YouTube, Vimeo, or direct MP4/WebM address.
      </p>
    );
  }

  if (embed.kind === "file") {
    return (
      <video
        controls
        playsInline
        preload="none"
        className="aspect-video w-full rounded-xl bg-black"
        aria-label={title}
      >
        <source src={embed.src} />
        {captions && <track src={captions} kind="captions" srcLang="en" label="English" default />}
        Your browser cannot play this video. Read the lesson text instead.
      </video>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-xl bg-black">
      <iframe
        src={embed.src}
        title={title}
        className="size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

export function LessonBody({ body }: { body: string }) {
  const text = body.trim();
  if (!text) return null;
  const paragraphs = text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return (
    <div className="max-w-prose space-y-4 text-base leading-7">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
