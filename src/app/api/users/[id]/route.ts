// src/app/api/users/[id]/route.ts
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { authErrorResponse, requireModule } from "@/lib/rbac/guard";
import { updateUserSchema } from "@/lib/validations/user";

type Context = { params: Promise<{ id: string }> };

const userSelect = {
  id: true,
  name: true,
  email: true,
  isActive: true,
  createdAt: true,
  role: { select: { id: true, name: true } },
} as const;

export async function GET(_request: Request, { params }: Context) {
  try {
    await requireModule("user-accounts");
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const current = await requireModule("user-accounts");
    const { id } = await params;

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = updateUserSchema.safeParse(await request.json());
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }
    const { name, roleId, isActive, password } = result.data;

    // Guard against self-lockout: you can't disable or de-role your own account.
    if (current.id === id) {
      if (isActive === false) {
        return NextResponse.json(
          { error: "You can't disable your own account." },
          { status: 400 },
        );
      }
      if (roleId === null) {
        return NextResponse.json(
          { error: "You can't remove your own role." },
          { status: 400 },
        );
      }
    }

    if (roleId) {
      const role = await prisma.role.findUnique({ where: { id: roleId } });
      if (!role) {
        return NextResponse.json(
          { error: "Selected role no longer exists" },
          { status: 400 },
        );
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(roleId !== undefined ? { roleId } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(password ? { password: await hashPassword(password) } : {}),
      },
      select: userSelect,
    });

    return NextResponse.json({ user });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PATCH(_request: Request, { params }: Context) {
  try {
    const current = await requireModule("user-accounts");
    const { id } = await params;

    if (current.id === id) {
      return NextResponse.json(
        { error: "You can't archive your own account." },
        { status: 400 },
      );
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!target.isActive) {
      return NextResponse.json(
        { error: "User is already archived" },
        { status: 409 },
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: userSelect,
    });

    return NextResponse.json({ user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
