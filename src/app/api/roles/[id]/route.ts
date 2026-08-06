// src/app/api/roles/[id]/route.ts
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { authErrorResponse, requireModule } from "@/lib/rbac/guard";
import { ALL_MODULE_KEYS } from "@/lib/rbac/modules";
import { roleSchema } from "@/lib/validations/role";

type Context = { params: Promise<{ id: string }> };

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

export async function GET(_request: Request, { params }: Context) {
  try {
    await requireModule("user-roles");
    const { id } = await params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: { modules: true, _count: { select: { users: true } } },
    });
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ role: serializeRole(role) });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    await requireModule("user-roles");
    const { id } = await params;

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const result = roleSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    const { name, description, modules } = result.data;

    // Enforce unique name (excluding this role).
    const clash = await prisma.role.findFirst({ where: { name, NOT: { id } } });
    if (clash) {
      return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
    }

    // Update the role and re-sync its tagged modules (replace the whole set).
    const updated = await prisma.$transaction(async (tx) => {
      // System roles keep their name; only description + modules are editable.
      await tx.role.update({
        where: { id },
        data: role.isSystem ? { description: description || null } : { name, description: description || null },
      });

      await tx.roleModule.deleteMany({ where: { roleId: id } });
      await tx.roleModule.createMany({
        data: normalizeModules(modules).map((module) => ({ roleId: id, module })),
      });

      return tx.role.findUnique({
        where: { id },
        include: { modules: true, _count: { select: { users: true } } },
      });
    });

    return NextResponse.json({ role: updated ? serializeRole(updated) : null });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    await requireModule("user-roles");
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
