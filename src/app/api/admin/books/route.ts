import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/db";

// 1. List books with pagination & search
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          authors: {
            some: {
              author: {
                name: { contains: search, mode: "insensitive" }
              }
            }
          }
        }
      ];
    }

    const [books, totalCount] = await Promise.all([
      prisma.book.findMany({
        where,
        take: limit,
        skip: skip,
        include: {
          publisher: { select: { id: true, name: true } },
          authors: { select: { authorId: true, author: { select: { name: true } } } },
          categories: { select: { categoryId: true, category: { select: { name: true } } } },
          images: { select: { url: true } }
        },
        orderBy: { title: "asc" }
      }),
      prisma.book.count({ where })
    ]);

    return NextResponse.json({
      books,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Admin list books error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 2. Add a new book
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { 
      title, 
      price, 
      stock, 
      description, 
      publisherId, 
      authorIds, 
      categoryIds, 
      imageUrls 
    } = body;

    if (!title || !price) {
      return NextResponse.json({ error: "Tiêu đề sách và Giá tiền là bắt buộc." }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock || "0", 10);

    const newBook = await prisma.book.create({
      data: {
        title,
        price: parsedPrice,
        stock: parsedStock,
        description: description || "",
        publisherId: publisherId || null,
        authors: authorIds && Array.isArray(authorIds) ? {
          create: authorIds.map((authorId: string) => ({
            authorId
          }))
        } : undefined,
        categories: categoryIds && Array.isArray(categoryIds) ? {
          create: categoryIds.map((categoryId: string) => ({
            categoryId
          }))
        } : undefined,
        images: imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0 ? {
          create: imageUrls.map((url: string) => ({
            url
          }))
        } : undefined
      }
    });

    return NextResponse.json({ message: "Thêm sách mới thành công", book: newBook });
  } catch (error) {
    console.error("Admin create book error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 3. Edit book - full information (transaction-safe)
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyJWT(token);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { 
      bookId, 
      title, 
      price, 
      stock, 
      description, 
      publisherId, 
      authorIds, 
      categoryIds, 
      imageUrls 
    } = body;

    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    }

    const updatedBook = await prisma.$transaction(async (tx) => {
      // 1. Update core properties
      const bookUpdateData: any = {};
      if (title !== undefined) bookUpdateData.title = title;
      if (price !== undefined) bookUpdateData.price = parseFloat(price);
      if (stock !== undefined) bookUpdateData.stock = parseInt(stock, 10);
      if (description !== undefined) bookUpdateData.description = description;
      if (publisherId !== undefined) bookUpdateData.publisherId = publisherId || null;

      const book = await tx.book.update({
        where: { id: bookId },
        data: bookUpdateData
      });

      // 2. Update authors relation
      if (authorIds && Array.isArray(authorIds)) {
        await tx.bookAuthor.deleteMany({ where: { bookId } });
        if (authorIds.length > 0) {
          await tx.bookAuthor.createMany({
            data: authorIds.map((authorId: string) => ({ bookId, authorId }))
          });
        }
      }

      // 3. Update categories relation
      if (categoryIds && Array.isArray(categoryIds)) {
        await tx.bookCategory.deleteMany({ where: { bookId } });
        if (categoryIds.length > 0) {
          await tx.bookCategory.createMany({
            data: categoryIds.map((categoryId: string) => ({ bookId, categoryId }))
          });
        }
      }

      // 4. Update images relation
      if (imageUrls && Array.isArray(imageUrls)) {
        await tx.bookImage.deleteMany({ where: { bookId } });
        if (imageUrls.length > 0) {
          await tx.bookImage.createMany({
            data: imageUrls.map((url: string) => ({ bookId, url }))
          });
        }
      }

      return book;
    });

    return NextResponse.json({ message: "Book updated successfully", book: updatedBook });
  } catch (error) {
    console.error("Admin update book error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
