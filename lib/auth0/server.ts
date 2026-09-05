import "server-only";
import { cookies } from "next/headers";
import { mockUsers } from "./users";

export const SESSION_COOKIE = "eqdesk_mock_session";
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

// This demo accepts only the four fixed identities; it does not authenticate credentials.
export const auth0 = {
  async getSession() {
    const userId = (await cookies()).get(SESSION_COOKIE)?.value;
    const user = mockUsers.find((user) => user.sub === userId);
    return user ? { user } : null;
  },
};
