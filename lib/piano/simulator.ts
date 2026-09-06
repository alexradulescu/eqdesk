import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const ARTICLE_RESOURCE = "EQDESK_ARTICLES";
const directory = path.join(process.cwd(), ".demo-data", "piano");
const accessPath = (uid: string) =>
  path.join(
    directory,
    `${createHash("sha256").update(uid).digest("hex")}.json`,
  );

type Access = {
  access_id: string;
  expire_date: number;
  resource: { rid: string };
};

// Relevant shape of Piano publisher/user/access/check. This performs no network request.
export async function checkAccess(uid: string, rid: string) {
  let stored: Access | undefined;
  try {
    stored = JSON.parse(await readFile(accessPath(uid), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const granted = Boolean(
    stored &&
      stored.resource.rid === rid &&
      stored.expire_date > Date.now() / 1000,
  );
  return { code: 0, access: { ...stored, granted } };
}

export async function hasArticleAccess(uid: string) {
  return (await checkAccess(uid, ARTICLE_RESOURCE)).access.granted;
}

export async function simulateOfferPurchase(uid: string) {
  const access: Access = {
    access_id: randomUUID(),
    expire_date: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    resource: { rid: ARTICLE_RESOURCE },
  };
  await mkdir(directory, { recursive: true });
  const destination = accessPath(uid);
  const temporary = `${destination}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(access));
  await rename(temporary, destination);
}

export async function resetSubscription(uid: string) {
  await rm(accessPath(uid), { force: true });
}
