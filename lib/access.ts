import { createHmac, timingSafeEqual } from "node:crypto";

import { PASSWORD } from "./api-token";

export { PASSWORD } from "./api-token";
export const SESSION_COOKIE = "cryptowire-session";
export const SESSION_SECONDS = 24 * 60 * 60;

function sign(value: string) {
  return createHmac("sha256", PASSWORD).update(value).digest("hex");
}

export function createSession(now = Date.now()) {
  const expires = String(now + SESSION_SECONDS * 1000);
  return `${expires}.${sign(expires)}`;
}

export function validSession(value: string | undefined, now = Date.now()) {
  if (!value) return false;
  const [expires, signature = ""] = value.split(".");
  const expected = sign(expires);
  return (
    Number(expires) > now &&
    /^[a-f0-9]{64}$/.test(signature) &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  );
}
