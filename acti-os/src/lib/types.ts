export type UserRole = "applicant" | "student" | "admin";

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "offered"
  | "rejected"
  | "waitlisted"
  | "accepted"
  | "enrolled";

export type AdmissionDecisionType = "offered" | "rejected" | "waitlisted";

export type DocumentType =
  | "passport_photo"
  | "national_id"
  | "certificate"
  | "transcript"
  | "other";

export type FeeType = "application_fee" | "acceptance_fee" | "tuition";

export type PaymentStatus = "pending" | "success" | "failed" | "abandoned";

export type ProgrammePillar =
  | "technology"
  | "technical_vocational"
  | "innovation_entrepreneurship";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  student_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Programme = {
  id: string;
  code: string;
  name: string;
  pillar: ProgrammePillar;
  description: string;
  duration: string | null;
  is_active: boolean;
  created_at: string;
};

export type FeeSchedule = {
  id: string;
  programme_id: string | null;
  fee_type: FeeType;
  amount_kobo: number;
  currency: string;
  is_active: boolean;
  created_at: string;
};

export type Application = {
  id: string;
  user_id: string;
  programme_id: string | null;
  status: ApplicationStatus;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  state_of_origin: string | null;
  lga: string | null;
  address: string | null;
  highest_qualification: string | null;
  previous_institution: string | null;
  graduation_year: number | null;
  personal_statement: string | null;
  submitted_at: string | null;
  enrolled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationDocument = {
  id: string;
  application_id: string;
  user_id: string;
  doc_type: DocumentType;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  created_at: string;
};

export type AdmissionDecision = {
  id: string;
  application_id: string;
  decision: AdmissionDecisionType;
  notes: string | null;
  decided_by: string;
  decided_at: string;
};

export type Payment = {
  id: string;
  user_id: string;
  application_id: string | null;
  fee_type: FeeType;
  amount_kobo: number;
  currency: string;
  status: PaymentStatus;
  /** Unique bank-transfer reference (column name kept for schema compatibility). */
  paystack_reference: string;
  paystack_access_code: string | null;
  paid_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  offered: "Offer made",
  rejected: "Not admitted",
  waitlisted: "Waitlisted",
  accepted: "Accepted",
  enrolled: "Enrolled",
};

export const FEE_TYPE_LABELS: Record<FeeType, string> = {
  application_fee: "Application fee",
  acceptance_fee: "Acceptance fee",
  tuition: "Tuition",
};

export const PILLAR_LABELS: Record<ProgrammePillar, string> = {
  technology: "Technology and Digital Education",
  technical_vocational: "Technical and Vocational Education",
  innovation_entrepreneurship: "Innovation and Entrepreneurship",
};

export const INSTITUTION = {
  name: "Amana College of Technology and Innovation",
  shortName: "ACTI",
  founder: "Edet Amana Foundation",
  tagline: "Technology Driven. Innovation Focused. Future Ready.",
  address: "1 Edet Amana Crescent, Uya-Oro, Oron, Akwa Ibom State, Nigeria",
  vision:
    "To become a leading technology-driven institution for technical, vocational, and innovative education in Africa.",
  mission:
    "To provide accessible, industry-relevant education that combines academic excellence, practical skills, innovation, and entrepreneurship, preparing learners to create jobs, solve real-world problems, and contribute meaningfully to national development.",
  values: [
    {
      title: "Innovation",
      body: "Embracing creativity and technology in learning and problem-solving.",
    },
    {
      title: "Excellence",
      body: "Maintaining high academic and professional standards.",
    },
    {
      title: "Integrity",
      body: "Promoting honesty, accountability, and ethical leadership.",
    },
    {
      title: "Practical Learning",
      body: "Focusing on hands-on training and real-world application.",
    },
    {
      title: "Entrepreneurship",
      body: "Equipping learners to create opportunities and build sustainable ventures.",
    },
    {
      title: "Community Impact",
      body: "Advancing education and economic development within our communities.",
    },
  ],
} as const;
