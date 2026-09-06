import "server-only";
import { cookies } from "next/headers";

export const EXPERIENCE_COOKIE = "eqdesk_access_experience";

// Local stand-in for Amplitude server evaluation. No analytics are transmitted.
export async function getAccessExperience() {
  const value = (await cookies()).get(EXPERIENCE_COOKIE)?.value;
  return value === "piano" ? "piano" : "legacy_regwall";
}
