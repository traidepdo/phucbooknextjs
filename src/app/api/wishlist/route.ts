import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/db";

// 1. Get all wishlist books
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.userId },
      include: {
        book: {
          include: {
            images: {
              take: 1,
              select: { url: true }
            },
            authors: {
              include: {
                author: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 2. Add to wishlist
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { bookId } = await req.json();
    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    }

    // Check if book exists
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_bookId: {
          userId: user.userId,
          bookId: book.id
        }
      }
    });

    if (existing) {
      return NextResponse.json({ message: "Book already in wishlist" });
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: user.userId,
        bookId: book.id
      }
    });

    return NextResponse.json({ message: "Added to wishlist successfully", wishlistItem });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 3. Remove from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    }

    await prisma.wishlist.delete({
      where: {
        userId_bookId: {
          userId: user.userId,
          bookId: bookId
        }
      }
    });

    return NextResponse.json({ message: "Removed from wishlist successfully" });
  } catch (error) {
    console.error("Delete wishlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
