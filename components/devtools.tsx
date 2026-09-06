import { getAccessExperience } from "@/lib/amplitude/flags";
import { auth0 } from "@/lib/auth0/server";

export async function Devtools() {
  const [experience, session] = await Promise.all([
    getAccessExperience(),
    auth0.getSession(),
  ]);
  return (
    <div className="container devtools">
      <span>
        Devtools · {experience === "piano" ? "Piano paywall" : "Legacy regwall"}
      </span>
      <form action="/devtools/access-experience" method="post">
        <button
          type="submit"
          name="experience"
          value={experience === "piano" ? "legacy_regwall" : "piano"}
        >
          Switch to{" "}
          {experience === "piano" ? "legacy regwall" : "Piano paywall"}
        </button>
      </form>
      <form action="/devtools/clear-reading-cookie" method="post">
        <button type="submit">Clear reading cookie</button>
      </form>
      <form action="/demo/piano/reset" method="post">
        <button type="submit" disabled={!session}>
          Reset my demo subscription
        </button>
      </form>
    </div>
  );
}
