import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
      const response = NextResponse.json({ error: "Invalid token" }, { status: 401 });
      response.cookies.set("token", "", { httpOnly: true, expires: new Date(0), path: "/" });
      return response;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      const response = NextResponse.json({ error: "User not found" }, { status: 404 });
      response.cookies.set("token", "", { httpOnly: true, expires: new Date(0), path: "/" });
      return response;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
