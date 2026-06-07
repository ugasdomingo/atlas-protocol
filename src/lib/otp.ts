import crypto from "crypto";
import bcrypt from "bcryptjs";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutos
const OTP_MAX_ATTEMPTS = 5;

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function verifyOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

export function isOtpExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  return new Date() > expiresAt;
}

export function otpExpiresAt(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MS);
}

export function canSendOtp(lastSentAt: Date | null): boolean {
  if (!lastSentAt) return true;
  return Date.now() - lastSentAt.getTime() > 60_000; // 60s entre envíos
}

export { OTP_MAX_ATTEMPTS };
