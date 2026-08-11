export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
  body: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "welcome-to-acti-os",
    title: "Welcome to ACTI OS — your digital campus",
    excerpt:
      "How applicants and students use ACTI OS for admissions, fees, and academic services.",
    category: "Campus",
    author: "ACTI Admissions",
    publishedAt: "2026-08-01",
    readingMinutes: 4,
    body: [
      "ACTI OS is the digital operating system for Amana College of Technology and Innovation. It connects admissions, payments, student records, and communication in one secure place.",
      "Prospective students can create an account, complete an online application, upload documents, and pay fees by bank transfer using a unique payment reference.",
      "After enrollment, students access their dashboard, payment history, notifications, and — now — the ACTI E-Library for curated learning resources.",
      "Our goal is simple: less paperwork, clearer status tracking, and more time for learning, building, and innovating.",
    ],
  },
  {
    slug: "how-to-apply-online",
    title: "How to apply online in six steps",
    excerpt:
      "A practical guide from account creation to enrollment at ACTI.",
    category: "Admissions",
    author: "ACTI Admissions",
    publishedAt: "2026-08-03",
    readingMinutes: 5,
    body: [
      "Applying to ACTI is fully online. Start by creating your ACTI OS account with a valid email address.",
      "Complete the multi-step application: personal details, academic background, preferred programme, and document uploads (passport photo, ID, certificates).",
      "Generate your application fee payment reference and transfer the exact amount, including the reference in your bank narration.",
      "Track your status in the applicant portal. If you receive an offer, pay the acceptance fee the same way to enroll and receive your student ID.",
      "Need help? Visit the Admissions page or contact the campus team in Oron.",
    ],
  },
  {
    slug: "choosing-your-pillar",
    title: "Choosing your pathway: Technology, Technical, or Entrepreneurship",
    excerpt:
      "Understand ACTI’s three academic pillars and find the track that fits your goals.",
    category: "Programmes",
    author: "Academic Affairs",
    publishedAt: "2026-08-05",
    readingMinutes: 6,
    body: [
      "ACTI organises learning around three pillars: Technology & Digital Education, Technical & Vocational Education, and Innovation & Entrepreneurship.",
      "Technology pathways cover software, AI, cybersecurity, data systems, and ICT skills for the digital workplace.",
      "Technical & Vocational pathways emphasise hands-on competence — engineering diplomas, repairs, electrical systems, renewable energy, and NSQ-aligned training.",
      "Innovation & Entrepreneurship pathways help learners design products, launch ventures, and build sustainable businesses.",
      "Explore the Programmes page, then apply with your preferred choice. You can discuss options with advisers after admission.",
    ],
  },
  {
    slug: "bank-transfer-payment-guide",
    title: "Paying fees by bank transfer — using your unique reference",
    excerpt:
      "Why every payment has a unique code, and how finance confirms your transfer.",
    category: "Finance",
    author: "ACTI Finance",
    publishedAt: "2026-08-07",
    readingMinutes: 3,
    body: [
      "ACTI currently collects application and acceptance fees by bank transfer. When you start a payment in ACTI OS, the system generates a unique reference such as ACTI-APP-8F3K2Q.",
      "Transfer the exact amount shown and put that reference in the narration/description field of your transfer.",
      "Keep your receipt. An administrator will match the reference to your account and confirm the payment — usually within 1–2 business days.",
      "Once confirmed, your application is submitted or your enrollment is completed automatically.",
    ],
  },
  {
    slug: "learn-build-innovate",
    title: "Learn. Build. Innovate. — ACTI’s academic philosophy",
    excerpt:
      "Why practical projects, industry engagement, and entrepreneurship sit at the centre of ACTI.",
    category: "Academics",
    author: "Academic Affairs",
    publishedAt: "2026-08-09",
    readingMinutes: 4,
    body: [
      "ACTI’s philosophy is learn, build, and innovate. Students acquire knowledge, develop practical competence, and create real solutions.",
      "Projects, workshops, internships, and enterprise activities prepare graduates who can create jobs and solve local problems — not only pass exams.",
      "Technology powers the institution through ACTI OS, supporting admissions through student services on one platform.",
      "As the college grows, academic resources and the E-Library will expand with programme-aligned materials for every pathway.",
    ],
  },
];

export function getAllBlogPosts() {
  return [...BLOG_POSTS].sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : -1,
  );
}

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug) ?? null;
}
