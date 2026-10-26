const PERSONAL_PAN = /^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$/;
const ORG_PAN = /^[A-Z]{3}[CFHATBLJG][A-Z][0-9]{4}[A-Z]$/;
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const CIN = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
const IFSC = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const SWIFT = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

function upper(value: string): string {
  return value.trim().toUpperCase();
}

export function organizationFieldError(input: {
  orgName: string;
  orgEmail: string;
  orgPhone: string;
  incorporationNumber: string;
  registrationNumber: string;
}): string | null {
  if (input.orgName.trim().length < 2) return "Enter the organization name.";
  if (!EMAIL.test(input.orgEmail.trim())) return "Enter a valid organization email.";
  const phone = digits(input.orgPhone);
  const local = phone.startsWith("91") && phone.length === 12 ? phone.slice(2) : phone.startsWith("0") && phone.length === 11 ? phone.slice(1) : phone;
  if (!/^[1-9][0-9]{9}$/.test(local)) return "Enter a 10-digit Indian phone number. You can include +91.";
  if (!CIN.test(upper(input.incorporationNumber))) {
    return "Incorporation number must look like U74999TS2020PTC123456.";
  }
  const registration = upper(input.registrationNumber);
  if (registration && !/^[A-Z0-9][A-Z0-9/-]{3,29}$/.test(registration)) {
    return "Registration number must be 4–30 letters or digits.";
  }
  return null;
}

export function personalKycError(aadhaar: string, pan: string): string | null {
  const aadhaarDigits = digits(aadhaar);
  if (!/^[2-9][0-9]{11}$/.test(aadhaarDigits)) return "Aadhaar must be 12 digits and cannot start with 0 or 1.";
  if (/^(\d)\1{11}$/.test(aadhaarDigits)) return "Enter the Aadhaar number printed on the card.";
  const personalPan = upper(pan);
  if (!PERSONAL_PAN.test(personalPan)) return "Personal PAN must look like ABCDE1234F, with P as the fourth letter.";
  return null;
}

export function organizationKycError(orgPan: string, gst: string): string | null {
  const pan = upper(orgPan);
  const gstin = upper(gst);
  if (!ORG_PAN.test(pan)) return "Organization PAN must look like AABCC1234F. The fourth letter is not P.";
  if (!GSTIN.test(gstin)) return "GSTIN must be 15 characters, for example 36AABCC1234F1Z5.";
  if (gstin.slice(2, 12) !== pan) return "The GSTIN must contain the same organization PAN.";
  return null;
}

export function bankFieldError(input: {
  accountHolder: string;
  bankName: string;
  ifsc: string;
  accountNumber: string;
  swiftCode: string;
}): string | null {
  if (input.accountHolder.trim().length < 2) return "Enter the account holder name.";
  if (input.bankName.trim().length < 2) return "Enter the bank name.";
  if (!IFSC.test(upper(input.ifsc))) return "IFSC must look like HDFC0001234.";
  const account = digits(input.accountNumber);
  if (!/^[0-9]{9,18}$/.test(account)) return "Account number must be 9 to 18 digits.";
  const swift = upper(input.swiftCode);
  if (swift && !SWIFT.test(swift)) return "SWIFT must be 8 or 11 letters and digits.";
  return null;
}
