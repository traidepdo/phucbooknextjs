import { Book, Author, Category, BookImage, Publisher, Review } from "@prisma/client";

export interface AuthorBook {
    author: Author;
}

export interface CategoryBook {
    category: Category;
}

export interface ReviewWithUser extends Review {
    user: {
        name: string | null;
    };
}

export interface DetailBook extends Book {
    authors: AuthorBook[];
    categories: CategoryBook[];
    images: BookImage[];
    publisher: Publisher | null;
    reviews: ReviewWithUser[];
}
