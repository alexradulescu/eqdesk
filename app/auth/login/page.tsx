import type { Metadata } from "next";
import Link from "next/link";
import { getReturnTo } from "@/lib/auth0/return-to";
import { mockUsers } from "@/lib/auth0/users";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/auth/login">) {
  const returnTo = getReturnTo((await searchParams).returnTo);
  return (
    <main id="main-content" className="container login-page">
      <div className="login-card">
        <p className="login-eyebrow">WELCOME TO EQDESK</p>
        <h1>Choose your reader.</h1>
        <p className="login-description">
          This is a demo login. Pick a name to continue reading.
        </p>
        <form action="/auth/callback" method="get" className="user-options">
          <input type="hidden" name="returnTo" value={returnTo} />
          {mockUsers.map((user) => (
            <button
              key={user.sub}
              type="submit"
              name="user"
              value={user.sub}
              className="user-option"
            >
              <span className="user-initial" aria-hidden="true">
                {user.name[0]}
              </span>
              <span>{user.name}</span>
              <span className="user-arrow" aria-hidden="true">
                →
              </span>
            </button>
          ))}
        </form>
        <Link className="back-link" href={returnTo}>
          ← Continue without logging in
        </Link>
      </div>
    </main>
  );
}
