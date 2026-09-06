import "server-only";
import { getAccessExperience } from "@/lib/amplitude/flags";
import { auth0 } from "@/lib/auth0/server";
import { getLinkedIdentity } from "@/lib/piano/identity";
import { hasArticleAccess } from "@/lib/piano/simulator";
import { getReadArticles } from "@/lib/reading-meter";

export async function getReaderAccess() {
  const [session, experience] = await Promise.all([
    auth0.getSession(),
    getAccessExperience(),
  ]);
  // Legacy behaviour stays unchanged; paid records survive flag rollback.
  const unlimited = session
    ? experience === "legacy_regwall" ||
      (await hasArticleAccess(getLinkedIdentity(session.user).uid))
    : false;
  return {
    experience,
    unlimited,
    readArticles: unlimited ? [] : await getReadArticles(),
  };
}
