import { prisma } from "@/lib/db";
import type { DetailBook } from "@/lib/types/public/detailbook";

// Extend the Prisma query to include images, publisher and reviews
export async function getDetailBook(id: string) {
  const data = await prisma.book.findUnique({
    where: { id },
    include: {
      authors: {
        include: {
          author: true
        }
      },
      categories: {
        include: {
          category: true
        }
      },
      images: true,
      publisher: true,
      reviews: {
        include: {
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  return data as DetailBook | null;
}

// Fetch related books in the same category (limit to 4)
export async function getRelatedBooks(bookId: string, categoryName?: string) {
  if (!categoryName) return [];
  
  return await prisma.book.findMany({
    where: {
      id: { not: bookId },
      categories: {
        some: {
          category: {
            name: categoryName
          }
        }
      }
    },
    take: 4,
    select: {
      id: true,
      title: true,
      price: true,
      images: {
        select: {
          url: true
        }
      },
      authors: {
        select: {
          author: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });
}