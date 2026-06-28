import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/db";

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

    const body = await req.json().catch(() => ({}));
    const { cartItemIds, buyNowBookId, buyNowQuantity = 1, fullName, phoneNumber, shippingAddress } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: "Họ và tên người nhận là bắt buộc." }, { status: 400 });
    }
    if (!phoneNumber || !phoneNumber.trim()) {
      return NextResponse.json({ error: "Số điện thoại là bắt buộc." }, { status: 400 });
    }
    if (!shippingAddress || !shippingAddress.trim()) {
      return NextResponse.json({ error: "Địa chỉ nhận hàng là bắt buộc." }, { status: 400 });
    }

    let itemsToProcess: { bookId: string; quantity: number; price: number; title: string; cartItemId?: string }[] = [];

    // Case 1: Buy Now specific book immediately
    if (buyNowBookId) {
      const book = await prisma.book.findUnique({ where: { id: buyNowBookId } });
      if (!book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
      }
      if (book.stock < buyNowQuantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for "${book.title}". Only ${book.stock} remaining.` 
        }, { status: 400 });
      }
      itemsToProcess = [{
        bookId: book.id,
        quantity: buyNowQuantity,
        price: book.price,
        title: book.title
      }];
    } 
    // Case 2: Selected cart items checkout
    else if (cartItemIds && Array.isArray(cartItemIds) && cartItemIds.length > 0) {
      const cartItems = await prisma.cart.findMany({
        where: {
          id: { in: cartItemIds },
          userId: user.userId
        },
        include: { book: true }
      });

      if (cartItems.length === 0) {
        return NextResponse.json({ error: "No valid cart items found." }, { status: 400 });
      }

      for (const item of cartItems) {
        if (item.book.stock < item.quantity) {
          return NextResponse.json({ 
            error: `Insufficient stock for "${item.book.title}". Only ${item.book.stock} remaining.` 
          }, { status: 400 });
        }
      }

      itemsToProcess = cartItems.map(item => ({
        bookId: item.bookId,
        quantity: item.quantity,
        price: item.book.price,
        title: item.book.title,
        cartItemId: item.id
      }));
    } 
    // Case 3: Error - must specify what to checkout
    else {
      return NextResponse.json({ error: "Please select products to check out." }, { status: 400 });
    }

    // Calculate totals
    const subtotal = itemsToProcess.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 300000 ? 0 : 30000;
    const total = subtotal + shipping;

    // Generate unique order code
    const orderCode = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const finalShippingAddress = `${fullName.trim()} | ${phoneNumber.trim()} | ${shippingAddress.trim()}`;

    // Run transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          code: orderCode,
          total: total,
          status: "PENDING",
          shippingAddress: finalShippingAddress,
          userId: user.userId,
          orderItems: {
            create: itemsToProcess.map((item) => ({
              bookId: item.bookId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });

      // 2. Deduct stock
      for (const item of itemsToProcess) {
        await tx.book.update({
          where: { id: item.bookId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // 3. Clear only the processed cart items
      const processedCartItemIds = itemsToProcess
        .map(item => item.cartItemId)
        .filter((id): id is string => !!id);

      if (processedCartItemIds.length > 0) {
        await tx.cart.deleteMany({
          where: {
            id: { in: processedCartItemIds },
            userId: user.userId
          }
        });
      }

      return newOrder;
    });

    return NextResponse.json({ 
      message: "Order placed successfully", 
      orderId: order.id,
      orderCode: order.code
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
