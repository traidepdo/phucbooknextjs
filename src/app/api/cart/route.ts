import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/db";

// 1. Get Cart Items
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

    const cart = await prisma.cart.findMany({
      where: { userId: user.userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            price: true,
            stock: true,
            images: {
              take: 1,
              select: { url: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 2. Add / Update Cart Item
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

    const { bookId, quantity = 1 } = await req.json();
    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    }

    // Verify book exists and is in stock
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.stock < quantity) {
      return NextResponse.json({ error: `Not enough stock. Only ${book.stock} left.` }, { status: 400 });
    }

    // Check if item already in cart
    const existingCartItem = await prisma.cart.findFirst({
      where: {
        userId: user.userId,
        bookId: book.id
      }
    });

    let cartItem;
    if (existingCartItem) {
      // Update quantity
      cartItem = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cart.create({
        data: {
          userId: user.userId,
          bookId: book.id,
          quantity: quantity
        }
      });
    }

    return NextResponse.json({ message: "Added to cart successfully", cartItem });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 3. Delete Cart Item
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
    const cartItemId = searchParams.get("id");

    if (!cartItemId) {
      return NextResponse.json({ error: "Cart item ID is required" }, { status: 400 });
    }

    // Check if it belongs to user
    const existingItem = await prisma.cart.findUnique({
      where: { id: cartItemId }
    });

    if (!existingItem || existingItem.userId !== user.userId) {
      return NextResponse.json({ error: "Cart item not found or unauthorized" }, { status: 404 });
    }

    await prisma.cart.delete({
      where: { id: cartItemId }
    });

    return NextResponse.json({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
