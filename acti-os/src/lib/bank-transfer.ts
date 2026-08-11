import type { FeeType } from "@/lib/types";

const FEE_PREFIX: Record<FeeType, string> = {
  application_fee: "APP",
  acceptance_fee: "ACC",
  tuition: "TUI",
};

/** Human-typable unique reference for bank transfer narration. */
export function generatePaymentReference(feeType: FeeType) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `ACTI-${FEE_PREFIX[feeType]}-${code}`;
}

export type BankAccountDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
};

export function getBankAccountDetails(): BankAccountDetails {
  return {
    bankName: process.env.BANK_NAME || "Set BANK_NAME in .env.local",
    accountName: process.env.BANK_ACCOUNT_NAME || "Set BANK_ACCOUNT_NAME in .env.local",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || "Set BANK_ACCOUNT_NUMBER in .env.local",
  };
}
