import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [authors, categories, publishers] = await Promise.all([
      prisma.author.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.publisher.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
    ]);

    return NextResponse.json({ authors, categories, publishers });
  } catch (error) {
    console.error("Admin metadata load error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
