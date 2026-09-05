import { auth0 } from "@/lib/auth0/server";

export async function GET() {
  const session = await auth0.getSession();
  return Response.json(session?.user ?? null, {
    status: session ? 200 : 401,
    headers: { "Cache-Control": "no-store" },
  });
}
