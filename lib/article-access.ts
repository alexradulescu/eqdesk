import "server-only";
import { getAccessExperience } from "@/lib/amplitude/flags";
import { auth0 } from "@/lib/auth0/server";
import { getReadArticles } from "@/lib/reading-meter";
import { hasArticlesEntitlement } from "@/lib/revenuecat/simulator";

export async function getReaderAccess() {
  const [session, experience] = await Promise.all([
    auth0.getSession(),
    getAccessExperience(),
  ]);
  // Legacy behaviour stays unchanged; paid records survive flag rollback.
  const unlimited = session
    ? experience === "legacy_regwall" ||
      (await hasArticlesEntitlement(session.user.sub))
    : false;
  return {
    experience,
    unlimited,
    readArticles: unlimited ? [] : await getReadArticles(),
  };
}
