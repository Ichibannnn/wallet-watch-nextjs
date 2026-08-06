// Server-side authorization. Every protected Route Handler runs a check here,
// so the API — not the client — is the real gate. See lib/session.ts for how
// the caller is identified.
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { hasModuleAccess, type ModuleAccess } from "./permissions";
import type { ModuleKey } from "./modules";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: { id: string; name: string } | null;
  /** Module + sub-module keys this user's role is tagged with. */
  modules: ModuleAccess;
};

/**
 * Resolve the signed-in user (with role + tagged modules) from the session cookie.
 * Returns null when there is no valid session or the account is disabled.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: { include: { modules: true } } },
  });

  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    role: user.role ? { id: user.role.id, name: user.role.name } : null,
    modules: user.role?.modules.map((m) => m.module) ?? [],
  };
}

/** Thrown by requireModule; carries the HTTP status to respond with. */
export class AuthorizationError extends Error {
  constructor(
    readonly status: 401 | 403,
    message: string,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Ensure the caller's role is tagged with `module`, returning the user.
 * Throws AuthorizationError (401 unauthenticated / 403 forbidden) otherwise.
 * Wrap route handlers in try/catch and pass the error to `authErrorResponse`.
 */
export async function requireModule(module: ModuleKey): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthorizationError(401, "You must be signed in.");
  }
  if (!hasModuleAccess(user.modules, module)) {
    throw new AuthorizationError(403, "You don't have permission to do that.");
  }
  return user;
}

/** Turn an AuthorizationError into a JSON response; rethrow anything else. */
export function authErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  throw error;
}
