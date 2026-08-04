// src/app/api/auth/signin/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { signInSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signInSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { email, password } = result.data;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // Use the same message for "no user" and "wrong password" so the endpoint
    // doesn't reveal which emails are registered.
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // A disabled account authenticates but is not allowed in.
    if (!user.isActive) {
      return NextResponse.json({ error: "This account has been disabled." }, { status: 403 });
    }

    // Establish the signed session cookie the rest of the app trusts.
    await createSession(user.id);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role ? { id: user.role.id, name: user.role.name } : null,
          createdAt: user.createdAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
