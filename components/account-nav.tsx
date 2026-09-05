"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@/lib/auth0/client";
import { getReturnTo } from "@/lib/auth0/return-to";

export function AccountNav() {
  const { user } = useUser();
  const returnTo = encodeURIComponent(getReturnTo(usePathname()));

  return (
    <nav className="account-nav" aria-label="Account">
      {user && <span className="account-name">{user.name}</span>}
      {/* Auth endpoints need full navigation to refresh the server session. */}
      <a
        className="login-button"
        href={`/auth/${user ? "logout" : "login"}?returnTo=${returnTo}`}
      >
        {user ? "Log out" : "Log in"}
      </a>
    </nav>
  );
}
