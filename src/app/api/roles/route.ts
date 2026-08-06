// src/app/api/roles/route.ts
import { NextResponse } from "next/server";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { buildPageMeta, parsePagination } from "@/lib/pagination";
import { authErrorResponse, requireModule } from "@/lib/rbac/guard";
import { ALL_MODULE_KEYS, isModuleKey } from "@/lib/rbac/modules";
import { roleSchema } from "@/lib/validations/role";

/** Keep only known, de-duplicated module keys. */
function normalizeModules(modules: string[]): string[] {
  return ALL_MODULE_KEYS.filter((key) => modules.includes(key));
}

/** Flatten a role's RoleModule rows into a plain key list for the client. */
function serializeRole(role: {
  modules: { module: string }[];
  [k: string]: unknown;
}) {
  const { modules, ...rest } = role;
  return { ...rest, modules: modules.map((m) => m.module) };
}

/**
 * List roles with server-side search, filtering and pagination. Query params:
 *   - `search`   free text matched against name and description (insensitive)
 *   - `type`     "system" (built-in) | "custom" (user-created); else all
 *   - `module`   a module/sub-module key; keeps roles tagged with that access
 *   - `page` / `pageSize`  1-based pagination
 */
export async function GET(request: Request) {
  try {
    await requireModule("user-roles");

    const { searchParams } = new URL(request.url);
    const { page, skip, take } = parsePagination(searchParams);

    const search = searchParams.get("search")?.trim();
    const type = searchParams.get("type")?.trim();
    const moduleKey = searchParams.get("module")?.trim();

    const where: Prisma.RoleWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type === "system") {
      where.isSystem = true;
    } else if (type === "custom") {
      where.isSystem = false;
    }

    // Ignore an unknown module key rather than returning an empty page.
    if (moduleKey && isModuleKey(moduleKey)) {
      where.modules = { some: { module: moduleKey } };
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        orderBy: [{ isSystem: "desc" }, { name: "asc" }],
        include: {
          modules: true,
          _count: { select: { users: true } },
        },
        skip,
        take,
      }),
      prisma.role.count({ where }),
    ]);

    return NextResponse.json({
      roles: roles.map(serializeRole),
      meta: buildPageMeta(total, page, take),
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireModule("user-roles");

    const result = roleSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { name, description, modules } = result.data;

    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
    }

    const role = await prisma.role.create({
      data: {
        name,
        description: description || null,
        modules: { create: normalizeModules(modules).map((module) => ({ module })) },
      },
      include: { modules: true, _count: { select: { users: true } } },
    });

    return NextResponse.json({ role: serializeRole(role) }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
