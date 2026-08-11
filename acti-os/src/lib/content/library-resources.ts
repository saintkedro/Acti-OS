export type LibraryResourceType = "ebook" | "handout" | "guide" | "link";

export type LibraryResource = {
  id: string;
  title: string;
  description: string;
  type: LibraryResourceType;
  category: string;
  programmePillar?: "technology" | "technical_vocational" | "innovation_entrepreneurship" | "general";
  format: string;
  url: string;
  publishedAt: string;
};

export const LIBRARY_RESOURCES: LibraryResource[] = [
  {
    id: "lib-001",
    title: "ACTI Student Handbook (Orientation)",
    description:
      "Campus values, academic expectations, and how to use ACTI OS as a new student.",
    type: "guide",
    category: "Orientation",
    programmePillar: "general",
    format: "PDF / Web",
    url: "/resources/welcome-to-acti-os",
    publishedAt: "2026-08-01",
  },
  {
    id: "lib-002",
    title: "Admissions & Fee Payment Quick Guide",
    description:
      "Step-by-step notes on applications, bank transfer references, and enrollment.",
    type: "guide",
    category: "Admissions",
    programmePillar: "general",
    format: "Web",
    url: "/resources/bank-transfer-payment-guide",
    publishedAt: "2026-08-07",
  },
  {
    id: "lib-003",
    title: "Introduction to Software Development Pathways",
    description:
      "Overview of tools, learning outcomes, and project expectations for software tracks.",
    type: "handout",
    category: "Technology",
    programmePillar: "technology",
    format: "Web",
    url: "/resources/choosing-your-pillar",
    publishedAt: "2026-08-05",
  },
  {
    id: "lib-004",
    title: "Cybersecurity Fundamentals Reading List",
    description:
      "Curated starter topics: threats, hardening basics, and safe digital practice.",
    type: "ebook",
    category: "Technology",
    programmePillar: "technology",
    format: "Reading list",
    url: "https://www.cisa.gov/cybersecurity-best-practices",
    publishedAt: "2026-08-06",
  },
  {
    id: "lib-005",
    title: "Electrical Safety Primer for Workshops",
    description:
      "Core workshop safety practices for electrical and technical training environments.",
    type: "handout",
    category: "Technical & Vocational",
    programmePillar: "technical_vocational",
    format: "Web",
    url: "https://www.osha.gov/electrical",
    publishedAt: "2026-08-04",
  },
  {
    id: "lib-006",
    title: "Computer Hardware Troubleshooting Checklist",
    description:
      "A practical checklist for diagnosing common PC hardware and maintenance issues.",
    type: "handout",
    category: "Technical & Vocational",
    programmePillar: "technical_vocational",
    format: "Checklist",
    url: "/resources/learn-build-innovate",
    publishedAt: "2026-08-08",
  },
  {
    id: "lib-007",
    title: "Lean Startup One-Pager for Student Ventures",
    description:
      "Validate ideas quickly: problem, customer, MVP, and learning loops.",
    type: "guide",
    category: "Entrepreneurship",
    programmePillar: "innovation_entrepreneurship",
    format: "Web",
    url: "https://leanstartup.co/",
    publishedAt: "2026-08-02",
  },
  {
    id: "lib-008",
    title: "Digital Entrepreneurship Resource Pack",
    description:
      "Starter frameworks for product design, digital marketing basics, and pitching.",
    type: "ebook",
    category: "Entrepreneurship",
    programmePillar: "innovation_entrepreneurship",
    format: "Resource pack",
    url: "/resources/learn-build-innovate",
    publishedAt: "2026-08-09",
  },
  {
    id: "lib-009",
    title: "MDN Web Docs — Learn Web Development",
    description:
      "External reference library for HTML, CSS, and JavaScript fundamentals.",
    type: "link",
    category: "Technology",
    programmePillar: "technology",
    format: "External",
    url: "https://developer.mozilla.org/en-US/docs/Learn",
    publishedAt: "2026-08-03",
  },
  {
    id: "lib-010",
    title: "Study Skills & Project Planning Template",
    description:
      "Plan weekly study blocks and project milestones across any ACTI programme.",
    type: "guide",
    category: "Study skills",
    programmePillar: "general",
    format: "Template",
    url: "/resources/welcome-to-acti-os",
    publishedAt: "2026-08-10",
  },
];

export const LIBRARY_TYPE_LABELS: Record<LibraryResourceType, string> = {
  ebook: "E-book",
  handout: "Handout",
  guide: "Guide",
  link: "External link",
};

export function getLibraryResources() {
  return [...LIBRARY_RESOURCES].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : -1,
  );
}
