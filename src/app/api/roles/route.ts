// src/app/api/roles/route.ts
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { authErrorResponse, requirePermission } from "@/lib/rbac/guard";
import { MODULES } from "@/lib/rbac/modules";
import { roleSchema } from "@/lib/validations/role";

/** Normalize an incoming permission list into one row per known module. */
function permissionRows(permissions: { module: string; canCreate: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean }[]) {
  return MODULES.map(({ key }) => {
    const p = permissions.find((perm) => perm.module === key);
    return {
      module: key,
      canCreate: p?.canCreate ?? false,
      canRead: p?.canRead ?? false,
      canUpdate: p?.canUpdate ?? false,
      canDelete: p?.canDelete ?? false,
    };
  });
}

export async function GET() {
  try {
    await requirePermission("user-management", "read");

    const roles = await prisma.role.findMany({
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
    });

    return NextResponse.json({ roles });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("user-management", "create");

    const result = roleSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { name, description, permissions } = result.data;

    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
    }

    const role = await prisma.role.create({
      data: {
        name,
        description: description || null,
        permissions: { create: permissionRows(permissions) },
      },
      include: { permissions: true, _count: { select: { users: true } } },
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
