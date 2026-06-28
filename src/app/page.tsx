import React from "react";
import Link from "next/link";
import Hearder from "@/components/public/Hearder";
import Footer from "@/components/public/Footer";
import { prisma } from "@/lib/db";
import { 
  Compass, 
  BookOpen, 
  Atom, 
  Palette, 
  Smile, 
  ChevronLeft, 
  ChevronRight,
  ShoppingBag
} from "lucide-react";

export default async function Home() {
  // Fetch real data from the database using Prisma
  const popularBooks = await prisma.book.findMany({
    take: 4,
    include: {
      images: true,
      authors: {
        include: {
          author: true
        }
      }
    },
    orderBy: {
      reviews: {
        _count: "desc"
      }
    }
  });

  const newArrivals = await prisma.book.findMany({
    take: 2,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      images: true,
      authors: {
        include: {
          author: true
        }
      },
      categories: {
        include: {
          category: true
        }
      }
    }
  });

  return (
    <div className="app-layout" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)", color: "var(--foreground)" }}>
      <Hearder />

      {/* Main content wrapper */}
      <main style={{ flex: 1, padding: "120px 0 60px 0", maxWidth: "1200px", margin: "0 auto", width: "100%", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
        
        {/* 1. Hero Banner */}
        <section 
          style={{
            position: "relative",
            width: "100%",
            height: "420px",
            borderRadius: "20px",
            overflow: "hidden",
            backgroundImage: "linear-gradient(to right, rgba(0, 0, 0, 0.8) 40%, rgba(0, 0, 0, 0.3) 100%), url('/autumn_hero.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "3rem",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
            border: "1px solid var(--card-border)",
            marginBottom: "3.5rem"
          }}
        >
          <div style={{ maxWidth: "500px", zIndex: 2 }}>
            <span 
              style={{
                background: "rgba(224, 130, 68, 0.15)",
                color: "#e08244",
                padding: "0.35rem 0.85rem",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                border: "1px solid rgba(224, 130, 68, 0.3)",
                display: "inline-block",
                marginBottom: "1.25rem"
              }}
            >
              Seasonal Pick
            </span>
            <h1 
              style={{
                fontSize: "2.8rem",
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#ffffff",
                marginBottom: "1rem",
                letterSpacing: "-0.03em"
              }}
            >
              Autumn's Essential Reading
            </h1>
            <p 
              style={{
                fontSize: "1.05rem",
                color: "var(--text-muted)",
                lineHeight: "1.6",
                marginBottom: "2rem",
                fontWeight: 300
              }}
            >
              Discover the most anticipated literary releases of the season, hand-picked by our curators.
            </p>
            <Link 
              href="/products" 
              className="btn btn-primary" 
              style={{
                background: "linear-gradient(135deg, #e08244 0%, #c2692d 100%)",
                boxShadow: "0 4px 20px rgba(224, 130, 68, 0.3)",
                fontWeight: 600,
                padding: "0.8rem 1.8rem",
                textDecoration: "none",
                display: "inline-block",
                width: "fit-content"
              }}
            >
              Explore Collection
            </Link>
          </div>
        </section>

        {/* 2. Browse Genres */}
        <section style={{ marginBottom: "3.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", color: "#fff" }}>Browse Genres</h2>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            
            {/* Genre Item 1 */}
            <Link href="/products?category=Văn%20Học%20%26%20Tiểu%20Thuyết" style={{ textDecoration: "none" }} className="genre-card">
              <div className="genre-icon-wrapper">
                <Compass size={22} />
              </div>
              <span className="genre-title">Fiction</span>
            </Link>

            {/* Genre Item 2 */}
            <Link href="/products?category=Kỹ%20Năng%20Sống" style={{ textDecoration: "none" }} className="genre-card">
              <div className="genre-icon-wrapper">
                <BookOpen size={22} />
              </div>
              <span className="genre-title">Non-Fiction</span>
            </Link>

            {/* Genre Item 3 */}
            <Link href="/products?category=Khoa%20Học%20%26%20Lịch%20Sử" style={{ textDecoration: "none" }} className="genre-card">
              <div className="genre-icon-wrapper">
                <Atom size={22} />
              </div>
              <span className="genre-title">Science</span>
            </Link>

            {/* Genre Item 4 */}
            <Link href="/products?category=Kinh%20Tế%20%26%20Kinh%20Doanh" style={{ textDecoration: "none" }} className="genre-card">
              <div className="genre-icon-wrapper">
                <Palette size={22} />
              </div>
              <span className="genre-title">Arts</span>
            </Link>

            {/* Genre Item 5 */}
            <Link href="/products?category=Thiếu%20Nhi" style={{ textDecoration: "none" }} className="genre-card">
              <div className="genre-icon-wrapper">
                <Smile size={22} />
              </div>
              <span className="genre-title">Children</span>
            </Link>

          </div>
        </section>

        {/* 3. Popular Now */}
        <section style={{ marginBottom: "3.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>Popular Now</h2>
            <Link href="/products" style={{ color: "var(--primary)", fontSize: "0.9rem", textDecoration: "none", fontWeight: 500 }} className="hover-underline">
              View All
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "2rem" }}>
            {popularBooks.map((book) => {
              const authorName = book.authors[0]?.author.name || "Chủ đề tự do";
              const imageUrl = book.images[0]?.url || "/cover_echo.png";

              return (
                <div key={book.id} className="book-card">
                  <Link href={`/products/${book.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="book-cover-container">
                      <img src={imageUrl} alt={book.title} className="book-cover" />
                    </div>
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">{authorName}</p>
                    <p className="book-price">{book.price.toLocaleString("vi-VN")} đ</p>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. New Arrivals */}
        <section style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>New Arrivals</h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="carousel-btn"><ChevronLeft size={18} /></button>
              <button className="carousel-btn"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "2rem" }} className="new-arrivals-grid">
            {newArrivals.map((book, idx) => {
              const authorName = book.authors[0]?.author.name || "Chưa rõ tác giả";
              const categoryName = book.categories[0]?.category.name || "Mới nhất";
              const imageUrl = book.images[0]?.url || "/cover_glass.png";

              return (
                <div key={book.id} className="new-arrival-card">
                  <div className="new-arrival-cover-wrapper">
                    <img src={imageUrl} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    <span className={`arrival-tag ${idx === 0 ? "tag-new" : "tag-curated"}`}>
                      {idx === 0 ? "New Release" : "Top Curated"}
                    </span>
                    <Link href={`/products/${book.id}`} style={{ textDecoration: "none" }}>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", margin: 0 }} className="hover-primary-text">
                        {book.title}
                      </h3>
                    </Link>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {book.description || "Cuốn sách tuyệt vời mới được thêm vào thư viện của PhucBook."}
                    </p>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                        {book.price.toLocaleString("vi-VN")} đ
                      </span>
                      <button className="btn btn-secondary add-to-cart-small-btn">
                        <ShoppingBag size={14} />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      <Footer />

      {/* Custom Styles for Homepage elements using standard style tag for Server Component compatibility */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .new-arrivals-grid {
            grid-template-columns: 1fr !important;
          }
        }

        .genre-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .genre-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--card-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: all 0.3s ease;
        }
        .genre-card:hover .genre-icon-wrapper {
          background: var(--primary-glow);
          border-color: var(--primary);
          color: var(--foreground);
          transform: translateY(-3px);
          box-shadow: 0 4px 15px var(--primary-glow);
        }
        .genre-title {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
          transition: color 0.3s ease;
        }
        .genre-card:hover .genre-title {
          color: var(--foreground);
        }

        .book-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        .book-cover-container {
          position: relative;
          aspect-ratio: 2/3;
          border-radius: 12px;
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
        .book-card:hover .book-cover-container {
          border-color: var(--primary);
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.25);
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
          transition: color 0.2s ease;
        }
        .book-card:hover .book-title {
          color: var(--primary);
        }
        .book-author {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0 0 0.5rem 0;
        }
        .book-price {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .hover-underline:hover {
          text-decoration: underline !important;
        }

        .hover-primary-text:hover {
          color: var(--primary) !important;
        }

        .carousel-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--card-border);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .carousel-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .new-arrival-card {
          background: rgba(20, 20, 25, 0.5);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          gap: 1.25rem;
          transition: all 0.3s ease;
        }
        .new-arrival-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(20, 20, 25, 0.7);
          transform: translateY(-2px);
        }
        .new-arrival-cover-wrapper {
          width: 110px;
          height: 160px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .arrival-tag {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          width: fit-content;
        }
        .tag-new {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }
        .tag-curated {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .add-to-cart-small-btn {
          font-size: 0.8rem !important;
          padding: 0.4rem 0.8rem !important;
          border-radius: 6px !important;
          background: rgba(255,255,255,0.03);
        }
        .add-to-cart-small-btn:hover {
          background: var(--primary) !important;
          border-color: var(--primary) !important;
          color: #fff !important;
        }
      `}} />
    </div>
  );
}
