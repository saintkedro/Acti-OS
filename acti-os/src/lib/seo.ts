import type { Metadata } from "next";
import { INSTITUTION } from "@/lib/types";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://acti.edu.ng";

export const SITE_URL = siteUrl;

export const SITE_NAME = INSTITUTION.shortName;
export const SITE_FULL_NAME = INSTITUTION.name;
export const DEFAULT_OG_TITLE = `${INSTITUTION.shortName} — ${INSTITUTION.name}`;
export const DEFAULT_DESCRIPTION = `${INSTITUTION.name} (${INSTITUTION.shortName}) in Oron, Akwa Ibom. ${INSTITUTION.tagline} Apply online, pay fees by bank transfer, and manage your student journey on ACTI OS.`;

type PageMetaInput = {
  title: string;
  description: string;
  path?: string;
  index?: boolean;
  ogTitle?: string;
  /** When true, ignore the root "%s | ACTI" template. */
  absoluteTitle?: boolean;
};

/** Build consistent Metadata for a route (title uses root template "%s | ACTI"). */
export function pageMetadata({
  title,
  description,
  path = "/",
  index = true,
  ogTitle,
  absoluteTitle = false,
}: PageMetaInput): Metadata {
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const socialTitle = ogTitle ?? (absoluteTitle ? title : `${title} | ${SITE_NAME}`);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: SITE_FULL_NAME,
      locale: "en_NG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
}
