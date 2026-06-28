import { prisma } from "@/lib/db";

export interface GetProductsParams {
  limit?: number;
  skip?: number;
  category?: string;
  search?: string;
  sortBy?: "newest" | "price_asc" | "price_desc";
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  publisherId?: string;
}

export async function getProducts(params: GetProductsParams = {}) {
  const { 
    limit = 12, 
    skip = 0, 
    category, 
    search, 
    sortBy = "newest",
    minPrice,
    maxPrice,
    inStockOnly,
    publisherId
  } = params;

  // Build where conditions
  const where: any = {};

  if (category) {
    where.categories = {
      some: {
        category: {
          name: category
        }
      }
    };
  }

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

  // Filter by price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  // Filter by stock availability
  if (inStockOnly) {
    where.stock = {
      gt: 0
    };
  }

  // Filter by publisher
  if (publisherId) {
    where.publisherId = publisherId;
  }

  // Build orderBy
  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "price_asc") {
    orderBy = { price: "asc" };
  } else if (sortBy === "price_desc") {
    orderBy = { price: "desc" };
  }

  return await prisma.book.findMany({
    take: limit,
    skip: skip,
    where,
    select: {
      id: true,
      title: true,
      price: true,
      description: true,
      images: true,
      authors: {
        select: {
          author: {
            select: {
              name: true
            }
          }
        }
      },
      categories: {
        select: {
          category: {
            select: {
              name: true
            }
          }
        }
      },
    },
    orderBy
  });
}

export async function getCategories() {
  return await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      description: true
    },
    orderBy: {
      name: "asc"
    }
  });
}

export async function getPublishers() {
  return await prisma.publisher.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: "asc"
    }
  });
}