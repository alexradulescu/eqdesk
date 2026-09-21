"use client";

import { useState } from "react";
import "./login.css";

export default function Login() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function unlock(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      if (!response.ok) {
        setError("Incorrect password. Try again.");
        return;
      }
      const next =
        new URLSearchParams(window.location.search).get("next") || "/";
      const destination = new URL(next, window.location.origin);
      window.location.assign(
        destination.origin === window.location.origin ? destination.href : "/",
      );
    } catch {
      setError("Could not connect. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main id="main-content" className="login-screen">
      <form className="login-card" onSubmit={unlock}>
        <span className="logotype">
          Crypto<span>Wire</span>
          <span className="brand-dot">.</span>
        </span>
        <h1>Enter the password</h1>
        <p>Access lasts 24 hours on this browser.</p>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby={error ? "login-error" : undefined}
          aria-invalid={Boolean(error)}
        />
        <p id="login-error" role="alert" className="login-error">
          {error}
        </p>
        <button type="submit" disabled={pending}>
          {pending ? "Checking…" : "Continue"}
        </button>
      </form>
    </main>
  );
}
