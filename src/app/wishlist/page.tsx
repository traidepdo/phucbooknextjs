import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import Hearder from "@/components/public/Hearder";
import Footer from "@/components/public/Footer";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import { Heart, ArrowLeft, ShoppingBag, User } from "lucide-react";
import WishlistRemove from "@/components/wishlist/WishlistRemove";

export default async function WishlistPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let user = null;
  let wishlistItems: any[] = [];

  if (token) {
    user = await verifyJWT(token);
    if (user) {
      wishlistItems = await prisma.wishlist.findMany({
        where: { userId: user.userId },
        include: {
          book: {
            include: {
              images: true,
              authors: {
                include: {
                  author: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
    }
  }

  return (
    <div className="app-layout" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)", color: "var(--foreground)" }}>
      <Hearder />

      <main style={{ flex: 1, padding: "120px 0 60px 0", maxWidth: "1200px", margin: "0 auto", width: "100%", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
        
        {/* Header Title */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem", letterSpacing: "-0.03em" }}>
            Danh Sách Yêu Thích
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", fontWeight: 300 }}>
            {wishlistItems.length > 0 ? `Bạn đang có ${wishlistItems.length} cuốn sách trong danh sách yêu thích.` : "Không có sản phẩm nào trong danh sách yêu thích."}
          </p>
        </div>

        {!user ? (
          /* Case 1: Not Logged In */
          <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
            <Heart size={48} style={{ color: "var(--text-muted)", marginBottom: "1.5rem", opacity: 0.5 }} />
            <h3 style={{ color: "#fff", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Bạn chưa đăng nhập</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Hãy đăng nhập tài khoản để lưu lại những tựa sách yêu thích của bạn.</p>
            <Link href="/login" className="btn btn-primary" style={{ padding: "0.8rem 2rem" }}>
              Đăng Nhập Ngay
            </Link>
          </div>
        ) : wishlistItems.length === 0 ? (
          /* Case 2: Wishlist Empty */
          <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
            <Heart size={48} style={{ color: "var(--text-muted)", marginBottom: "1.5rem", opacity: 0.5 }} />
            <h3 style={{ color: "#fff", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Danh sách trống</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Bạn chưa yêu thích tựa sách nào. Hãy khám phá và lưu lại những cuốn sách hay!</p>
            <Link href="/products" className="btn btn-primary" style={{ padding: "0.8rem 2rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <ArrowLeft size={16} />
              Quay lại cửa hàng
            </Link>
          </div>
        ) : (
          /* Case 3: Wishlist Has Books */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "2rem" }}>
            {wishlistItems.map((item) => {
              const book = item.book;
              const authorName = book.authors[0]?.author.name || "Chưa rõ tác giả";
              const imageUrl = book.images[0]?.url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e";

              return (
                <div key={item.id} className="book-card" style={{ position: "relative" }}>
                  <Link href={`/products/${book.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
                    <div className="book-cover-container">
                      <img src={imageUrl} alt={book.title} className="book-cover" />
                    </div>
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">
                      <User size={12} style={{ display: "inline", marginRight: "4px" }} />
                      {authorName}
                    </p>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.5rem" }}>
                      <span className="book-price">{book.price.toLocaleString("vi-VN")} đ</span>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <WishlistRemove bookId={book.id} />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .book-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          background: rgba(20, 20, 25, 0.3);
          border: 1px solid var(--card-border);
          padding: 1rem;
          border-radius: 14px;
          transition: all 0.3s ease;
        }
        .book-cover-container {
          position: relative;
          aspect-ratio: 2/3;
          border-radius: 10px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--card-border);
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .book-cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .book-card:hover {
          border-color: var(--primary);
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.25);
          background: rgba(20, 20, 25, 0.5);
        }
        .book-card:hover .book-cover {
          transform: scale(1.05);
        }
        .book-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 0.25rem 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .book-author {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .book-price {
          font-size: 1rem;
          font-weight: 700;
          color: var(--primary);
        }
      `}} />
    </div>
  );
}
