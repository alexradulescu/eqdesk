import "server-only";
import type { User } from "@/lib/auth0/users";

// Simulates Identity Linking after Auth0 verification. No Piano ID login or JWT is issued.
// A live integration must supply a signed JWT with the configured issuer/audience.
export function getLinkedIdentity(user: User) {
  return { uid: user.sub, email: user.email };
}
