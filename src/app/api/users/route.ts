// src/app/api/users/route.ts
import { NextResponse } from "next/server";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { buildPageMeta, parsePagination } from "@/lib/pagination";
import { authErrorResponse, requireModule } from "@/lib/rbac/guard";
import { createUserSchema } from "@/lib/validations/user";

const userSelect = {
  id: true,
  name: true,
  email: true,
  isActive: true,
  createdAt: true,
  role: { select: { id: true, name: true } },
} as const;

/**
 * List users with server-side search, filtering and pagination. Query params:
 *   - `search`   free text matched against name and email (case-insensitive)
 *   - `role`     a roleId, or "none" for users with no role assigned
 *   - `status`   "active" | "disabled" (anything else means all)
 *   - `page` / `pageSize`  1-based pagination
 */
export async function GET(request: Request) {
  try {
    await requireModule("user-accounts");

    const { searchParams } = new URL(request.url);
    const { page, skip, take } = parsePagination(searchParams);

    const search = searchParams.get("search")?.trim();
    const role = searchParams.get("role")?.trim();
    const status = searchParams.get("status")?.trim();

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role === "none") {
      where.roleId = null;
    } else if (role) {
      where.roleId = role;
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "disabled") {
      where.isActive = false;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: userSelect,
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, meta: buildPageMeta(total, page, take) });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireModule("user-accounts");

    const result = createUserSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const { name, email, password, roleId, isActive } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json({ error: "Selected role no longer exists" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        roleId,
        isActive,
      },
      select: userSelect,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
