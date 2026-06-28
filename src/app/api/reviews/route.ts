import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/db";

// 1. Get user reviews
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

    const reviews = await prisma.review.findMany({
      where: { userId: user.userId },
      select: {
        id: true,
        bookId: true,
        rating: true,
        comment: true,
        createdAt: true
      }
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 2. Submit a review (Only if delivered and not reviewed yet)
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
    const { bookId, rating, comment } = body;

    if (!bookId) {
      return NextResponse.json({ error: "Mã sách là bắt buộc." }, { status: 400 });
    }
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Đánh giá sao phải từ 1 đến 5." }, { status: 400 });
    }

    // 1. Verify user purchased the book in a DELIVERED order
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId: user.userId,
        status: "DELIVERED",
        orderItems: {
          some: { bookId }
        }
      }
    });

    if (!deliveredOrder) {
      return NextResponse.json({ 
        error: "Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng chứa sản phẩm này giao thành công." 
      }, { status: 400 });
    }

    // 2. Verify user hasn't already reviewed this book
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.userId,
        bookId
      }
    });

    if (existingReview) {
      return NextResponse.json({ 
        error: "Bạn đã đánh giá sản phẩm này rồi. Mỗi khách hàng chỉ được đánh giá 1 lần cho mỗi tựa sách đã mua." 
      }, { status: 400 });
    }

    // 3. Create review
    const review = await prisma.review.create({
      data: {
        userId: user.userId,
        bookId,
        rating: Math.round(rating),
        comment: comment || ""
      }
    });

    return NextResponse.json({ message: "Đánh giá sản phẩm thành công", review });
  } catch (error) {
    console.error("Submit review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
