import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Hearder from "@/components/public/Hearder";
import Footer from "@/components/public/Footer";
import { getDetailBook, getRelatedBooks } from "@/lib/services/public/detailbook";
import AddToCart from "@/components/products/AddToCart";
import WishlistToggle from "@/components/products/WishlistToggle";
import {
    ShoppingBag,
    ArrowLeft,
    Star,
    Calendar,
    Building2,
    BookOpen,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Truck,
    RotateCcw
} from "lucide-react";

export default async function ProductSlugPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const book = await getDetailBook(slug);

    if (!book) {
        return notFound();
    }

    const categoryName = book.categories[0]?.category.name;
    const relatedBooks = await getRelatedBooks(book.id, categoryName);

    const authorName = book.authors[0]?.author.name || "Chưa rõ tác giả";
    const authorBio = book.authors[0]?.author.bio || "Chưa có tiểu sử tác giả.";
    const publisherName = book.publisher?.name || "Chưa rõ nhà xuất bản";
    const publisherAddress = book.publisher?.address || "Chưa cập nhật địa chỉ";
    const imageUrl = book.images[0]?.url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e";

    // Calculate average rating
    const reviewsCount = book.reviews.length;
    const averageRating = reviewsCount > 0
        ? (book.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1)
        : null;

    return (
        <div className="app-layout" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)", color: "var(--foreground)" }}>
            <Hearder />

            <main style={{ flex: 1, padding: "120px 0 60px 0", maxWidth: "1200px", margin: "0 auto", width: "100%", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>

                {/* Back Link & Breadcrumbs */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <Link href="/products" className="back-link-btn" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s ease" }}>
                        <ArrowLeft size={16} />
                        <span>Quay lại cửa hàng</span>
                    </Link>
                    <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        <Link href="/" style={{ color: "inherit", textDecoration: "none" }} className="hover-white">Trang Chủ</Link>
                        <span>/</span>
                        <Link href="/products" style={{ color: "inherit", textDecoration: "none" }} className="hover-white">Cửa Hàng</Link>
                        <span>/</span>
                        <span style={{ color: "#fff" }}>{book.title}</span>
                    </div>
                </div>

                {/* 2-Column Product Detail Layout */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem" }} className="detail-layout-grid">

                    {/* Left Column: Image Section */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div className="book-detail-cover-container">
                            <img src={imageUrl} alt={book.title} className="book-detail-cover" />
                        </div>
                        {book.images.length > 1 && (
                            <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto" }}>
                                {book.images.map((img, idx) => (
                                    <div key={img.id} className="thumb-container">
                                        <img src={img.url} alt={`Book image ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Information & Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        {/* Category Tag & Wishlist Toggle */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {categoryName && (
                                <span className="detail-category-tag">
                                    {categoryName}
                                </span>
                            )}
                            <WishlistToggle bookId={book.id} />
                        </div>

                        {/* Book Title */}
                        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", lineHeight: "1.2", margin: 0, letterSpacing: "-0.03em" }}>
                            {book.title}
                        </h1>

                        {/* Author and Rating Summary */}
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.5rem", fontSize: "0.95rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>Tác giả:</span>
                                <strong style={{ color: "#fff" }}>{authorName}</strong>
                            </div>

                            {averageRating && (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <div style={{ display: "flex", color: "#facc15" }}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                fill={i < Math.round(parseFloat(averageRating)) ? "#facc15" : "none"}
                                                stroke="currentColor"
                                            />
                                        ))}
                                    </div>
                                    <strong style={{ color: "#fff" }}>{averageRating}</strong>
                                    <span style={{ color: "var(--text-muted)" }}>({reviewsCount} đánh giá)</span>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div style={{ height: "1px", background: "var(--card-border)" }}></div>

                        {/* Price Box */}
                        <div style={{ display: "flex", alignItems: "baseline", gap: "1rem" }}>
                            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>
                                {book.price.toLocaleString("vi-VN")} đ
                            </span>
                            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                                {(book.price * 1.2).toLocaleString("vi-VN")} đ
                            </span>
                        </div>

                        {/* Short Description */}
                        <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: "1.6", margin: 0, fontWeight: 300 }}>
                            {book.description || "Chưa có tóm tắt nội dung cho cuốn sách này."}
                        </p>

                        {/* Stock status indicator */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                            {book.stock > 0 ? (
                                <>
                                    <CheckCircle2 size={16} style={{ color: "var(--success)" }} />
                                    <span style={{ color: "var(--success)" }}>Còn hàng (Trong kho: {book.stock})</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={16} style={{ color: "var(--error)" }} />
                                    <span style={{ color: "var(--error)" }}>Hết hàng</span>
                                </>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div style={{ marginTop: "1rem" }}>
                            <AddToCart bookId={book.id} stock={book.stock} />
                        </div>

                        {/* Trust Badges */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
                            <div className="trust-badge">
                                <ShieldCheck size={18} style={{ color: "var(--primary)" }} />
                                <span>100% Chính Hãng</span>
                            </div>
                            <div className="trust-badge">
                                <Truck size={18} style={{ color: "var(--primary)" }} />
                                <span>Giao Nhanh Toàn Quốc</span>
                            </div>
                            <div className="trust-badge">
                                <RotateCcw size={18} style={{ color: "var(--primary)" }} />
                                <span>Đổi Trả Dễ Dàng</span>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Tabbed Info & Reviews */}
                <section style={{ marginTop: "4.5rem", display: "flex", flexDirection: "column", gap: "2.5rem" }}>

                    {/* Detail specs & Author info */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }} className="tab-details-grid">
                        <div className="glass-panel" style={{ padding: "2rem" }}>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <BookOpen size={20} style={{ color: "var(--primary)" }} />
                                Thông Tin Chi Tiết
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.95rem" }}>
                                <div className="spec-row">
                                    <span>Nhà xuất bản:</span>
                                    <strong>{publisherName}</strong>
                                </div>
                                <div className="spec-row">
                                    <span>Địa chỉ NXB:</span>
                                    <strong>{publisherAddress}</strong>
                                </div>
                                <div className="spec-row">
                                    <span>Ngày xuất bản:</span>
                                    <strong>{new Date(book.createdAt).toLocaleDateString("vi-VN")}</strong>
                                </div>
                                <div className="spec-row">
                                    <span>Số lượng kho:</span>
                                    <strong>{book.stock} cuốn</strong>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: "2rem" }}>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Building2 size={20} style={{ color: "var(--primary)" }} />
                                Về Tác Giả ({authorName})
                            </h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0, fontWeight: 300 }}>
                                {authorBio}
                            </p>
                        </div>
                    </div>

                    {/* Book Reviews List */}
                    <div className="glass-panel" style={{ padding: "2.5rem" }}>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "2rem" }}>
                            Đánh Giá Của Độc Giả ({reviewsCount})
                        </h3>

                        {reviewsCount === 0 ? (
                            <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-muted)" }}>
                                Chưa có đánh giá nào cho cuốn sách này. Hãy là người đầu tiên đánh giá!
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                {book.reviews.map((review) => (
                                    <div key={review.id} style={{ borderBottom: "1px solid var(--card-border)", paddingBottom: "1.5rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                            <strong style={{ color: "#fff", fontSize: "0.95rem" }}>{review.user.name || "Khách Hàng"}</strong>
                                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", color: "#facc15", marginBottom: "0.5rem" }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={14}
                                                    fill={i < review.rating ? "#facc15" : "none"}
                                                    stroke="currentColor"
                                                />
                                            ))}
                                        </div>
                                        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.5", margin: 0 }}>
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </section>

                {/* Related Books */}
                {relatedBooks.length > 0 && (
                    <section style={{ marginTop: "4.5rem" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: "1.75rem" }}>Sách Liên Quan</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "2rem" }}>
                            {relatedBooks.map((relBook) => {
                                const relAuthor = relBook.authors[0]?.author.name || "Chưa rõ tác giả";
                                const relImg = relBook.images[0]?.url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e";

                                return (
                                    <div key={relBook.id} className="book-card">
                                        <Link href={`/products/${relBook.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                            <div className="book-cover-container">
                                                <img src={relImg} alt={relBook.title} className="book-cover" />
                                            </div>
                                            <h3 className="book-title">{relBook.title}</h3>
                                            <p className="book-author">{relAuthor}</p>
                                            <p className="book-price" style={{ color: "var(--primary)" }}>{relBook.price.toLocaleString("vi-VN")} đ</p>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

            </main>

            <Footer />

            <style dangerouslySetInnerHTML={{
                __html: `
        @media (min-width: 768px) {
          .detail-layout-grid {
            grid-template-columns: 400px 1fr !important;
          }
          .tab-details-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        .back-link-btn:hover {
          color: #fff !important;
        }
        .hover-white:hover {
          color: #fff !important;
        }

        .book-detail-cover-container {
          aspect-ratio: 2/3;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--card-border);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
        }
        .book-detail-cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumb-container {
          width: 70px;
          height: 95px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid var(--card-border);
          opacity: 0.7;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .thumb-container:hover {
          opacity: 1;
          border-color: var(--primary);
        }

        .detail-category-tag {
          background: var(--primary-glow);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.3);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.35rem 0.85rem;
          border-radius: 8px;
          width: fit-content;
          text-transform: uppercase;
        }

        .buy-now-btn:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.02);
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          border: 1px solid var(--card-border);
        }

        .spec-row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px dashed var(--card-border);
          padding-bottom: 0.65rem;
        }
        .spec-row span {
          color: var(--text-muted);
        }
        .spec-row strong {
          color: #fff;
        }

        /* Book card styles (matching search catalog) */
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
        }
        .book-price {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0;
        }
      `}} />
        </div>
    );
}
