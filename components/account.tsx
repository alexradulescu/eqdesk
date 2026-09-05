import { Auth0Provider } from "@/lib/auth0/client";
import { auth0 } from "@/lib/auth0/server";
import { AccountNav } from "./account-nav";

export async function Account() {
  const session = await auth0.getSession();
  return (
    <Auth0Provider user={session?.user ?? null}>
      <AccountNav />
    </Auth0Provider>
  );
}
