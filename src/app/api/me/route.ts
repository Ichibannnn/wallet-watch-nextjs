// src/app/api/me/route.ts
//
// Returns the signed-in user together with their role and tagged modules.
// The client (AuthProvider) calls this on load to hydrate RBAC state.
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/rbac/guard";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
    role: user.role,
    modules: user.modules,
  });
}
