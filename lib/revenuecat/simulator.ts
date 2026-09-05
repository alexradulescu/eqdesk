import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const directory = path.join(process.cwd(), ".demo-data", "revenuecat");
const subscriptionPath = (userId: string) =>
  path.join(
    directory,
    `${createHash("sha256").update(userId).digest("hex")}.json`,
  );

type Entitlement = {
  product_identifier: string;
  purchase_date: string;
  expires_date: string;
};

// Simulates RevenueCat REST v1 customer data; no RevenueCat SDK or Stripe calls.
export async function getCustomer(appUserId: string) {
  let articles: Entitlement | undefined;
  try {
    articles = JSON.parse(await readFile(subscriptionPath(appUserId), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return {
    subscriber: {
      original_app_user_id: appUserId,
      entitlements: articles ? { articles } : {},
    },
  };
}

export async function hasArticlesEntitlement(appUserId: string) {
  const { subscriber } = await getCustomer(appUserId);
  const access = subscriber.entitlements.articles;
  return Boolean(access && Date.parse(access.expires_date) > Date.now());
}

export async function simulatePurchase(appUserId: string) {
  const now = Date.now();
  const access: Entitlement = {
    product_identifier: "eqdesk_monthly",
    purchase_date: new Date(now).toISOString(),
    expires_date: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  await mkdir(directory, { recursive: true });
  const destination = subscriptionPath(appUserId);
  const temporary = `${destination}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(access));
  await rename(temporary, destination);
}

export async function resetSubscription(appUserId: string) {
  await rm(subscriptionPath(appUserId), { force: true });
}
