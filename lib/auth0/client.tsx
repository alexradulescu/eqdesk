"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { User } from "./users";

const UserContext = createContext<User | null>(null);

// Auth navigation reloads the page, so the server supplies a fresh session each time.
export function Auth0Provider({
  user,
  children,
}: {
  user: User | null;
  children: ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const user = useContext(UserContext);
  return { user, isLoading: false, error: undefined };
}
