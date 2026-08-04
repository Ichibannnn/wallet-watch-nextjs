// src/app/api/roles/[id]/route.ts
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { authErrorResponse, requirePermission } from "@/lib/rbac/guard";
import { MODULES } from "@/lib/rbac/modules";
import { roleSchema } from "@/lib/validations/role";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    await requirePermission("user-management", "read");
    const { id } = await params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true, _count: { select: { users: true } } },
    });
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ role });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    await requirePermission("user-management", "update");
    const { id } = await params;

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const result = roleSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const { name, description, permissions } = result.data;

    // Enforce unique name (excluding this role).
    const clash = await prisma.role.findFirst({ where: { name, NOT: { id } } });
    if (clash) {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
    }

    // Update the role and re-sync its permission matrix (one row per module).
    const updated = await prisma.$transaction(async (tx) => {
      // System roles keep their name; only description + permissions are editable.
      await tx.role.update({
        where: { id },
        data: role.isSystem ? { description: description || null } : { name, description: description || null },
      });

      for (const { key } of MODULES) {
        const p = permissions.find((perm) => perm.module === key);
        const data = {
          canCreate: p?.canCreate ?? false,
          canRead: p?.canRead ?? false,
          canUpdate: p?.canUpdate ?? false,
          canDelete: p?.canDelete ?? false,
        };
        await tx.permission.upsert({
          where: { roleId_module: { roleId: id, module: key } },
          update: data,
          create: { roleId: id, module: key, ...data },
        });
      }

      return tx.role.findUnique({
        where: { id },
        include: { permissions: true, _count: { select: { users: true } } },
      });
    });

    return NextResponse.json({ role: updated });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    await requirePermission("user-management", "delete");
    const { id } = await params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    if (role.isSystem) {
      return NextResponse.json({ error: "Built-in roles cannot be deleted" }, { status: 400 });
    }
    if (role._count.users > 0) {
      return NextResponse.json(
        { error: "Reassign the users on this role before deleting it" },
        { status: 400 },
      );
    }

    await prisma.role.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
