import bcrypt from "bcryptjs";

export async function hashOtp(
  otp: string
) {
  return bcrypt.hash(otp, 10);
}

export async function verifyOtp(
  otp: string,
  hash: string
) {
  return bcrypt.compare(otp, hash);
}