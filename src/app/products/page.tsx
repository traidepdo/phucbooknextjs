import React from "react";
import Link from "next/link";
import Hearder from "@/components/public/Hearder";
import Footer from "@/components/public/Footer";
import { getProducts, getCategories, getPublishers } from "@/lib/services/public/products";
import { Search, SlidersHorizontal, BookOpen, User, Tag, ShoppingBag, Filter, CheckCircle2, RotateCcw } from "lucide-react";

interface SearchParams {
  category?: string;
  search?: string;
  sortBy?: "newest" | "price_asc" | "price_desc";
  page?: string;
  minPrice?: string;
  maxPrice?: string;
  inStockOnly?: string;
  publisherId?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const currentCategory = params.category;
  const currentSearch = params.search;
  const currentSortBy = params.sortBy || "newest";
  const currentPage = parseInt(params.page || "1", 10);
  const itemsPerPage = 12;

  // New Filters
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const inStockOnly = params.inStockOnly === "true";
  const publisherId = params.publisherId;

  // Fetch data
  const categories = await getCategories();
  const publishers = await getPublishers();
  const products = await getProducts({
    limit: itemsPerPage,
    skip: (currentPage - 1) * itemsPerPage,
    category: currentCategory,
    search: currentSearch,
    sortBy: currentSortBy,
    minPrice,
    maxPrice,
    inStockOnly,
    publisherId,
  });

  return (
    <div className="app-layout" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)", color: "var(--foreground)" }}>
      <Hearder />

      <main style={{ flex: 1, padding: "120px 0 60px 0", maxWidth: "1200px", margin: "0 auto", width: "100%", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem", letterSpacing: "-0.03em" }}>
            Cửa Hàng Sách
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", fontWeight: 300 }}>
            Khám phá hơn 100+ tựa sách chọn lọc từ kho tri thức của PhucBook.
          </p>
        </div>

        {/* Filters and Search Bar Container */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          {/* Search Form */}
          <form method="GET" action="/products" style={{ position: "relative", flex: 1, maxWidth: "450px", minWidth: "280px" }}>
            {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
            {currentSortBy && <input type="hidden" name="sortBy" value={currentSortBy} />}
            {params.minPrice && <input type="hidden" name="minPrice" value={params.minPrice} />}
            {params.maxPrice && <input type="hidden" name="maxPrice" value={params.maxPrice} />}
            {params.inStockOnly && <input type="hidden" name="inStockOnly" value={params.inStockOnly} />}
            {params.publisherId && <input type="hidden" name="publisherId" value={params.publisherId} />}
            <input 
              type="text" 
              name="search"
              defaultValue={currentSearch || ""}
              placeholder="Tìm kiếm sách, tác giả..."
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.75rem",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--card-border)",
                color: "var(--foreground)",
                outline: "none",
                fontSize: "0.9rem",
                transition: "all 0.2s ease"
              }}
              className="search-input-field"
            />
            <Search 
              size={18} 
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
          </form>

          {/* Sort Filter Selector */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <SlidersHorizontal size={16} />
              Sắp xếp:
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link 
                href={{
                  pathname: "/products",
                  query: { ...params, sortBy: "newest" },
                }}
                className={`sort-tab ${currentSortBy === "newest" ? "active-sort-tab" : ""}`}
              >
                Mới nhất
              </Link>
              <Link 
                href={{
                  pathname: "/products",
                  query: { ...params, sortBy: "price_asc" },
                }}
                className={`sort-tab ${currentSortBy === "price_asc" ? "active-sort-tab" : ""}`}
              >
                Giá tăng dần
              </Link>
              <Link 
                href={{
                  pathname: "/products",
                  query: { ...params, sortBy: "price_desc" },
                }}
                className={`sort-tab ${currentSortBy === "price_desc" ? "active-sort-tab" : ""}`}
              >
                Giá giảm dần
              </Link>
            </div>
          </div>
        </div>

        {/* Grid layout containing Sidebar Filters & Products */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }} className="products-layout-grid">
          
          {/* Sidebar / Left Column: Multi-Filters Form */}
          <aside className="sidebar-container" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Category Filter */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: "1.25rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.75rem" }}>
                Thể Loại Sách
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Link 
                  href={{
                    pathname: "/products",
                    query: { ...params, category: undefined, page: undefined },
                  }}
                  className={`category-item-link ${!currentCategory ? "active-category-item" : ""}`}
                >
                  Tất Cả Thể Loại
                </Link>
                {categories.map((cat) => (
                  <Link 
                    key={cat.id}
                    href={{
                      pathname: "/products",
                      query: { ...params, category: cat.name, page: undefined },
                    }}
                    className={`category-item-link ${currentCategory === cat.name ? "active-category-item" : ""}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Advanced Filters Form */}
            <form method="GET" action="/products" className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Maintain other active parameters */}
              {currentCategory && <input type="hidden" name="category" value={currentCategory} />}
              {currentSearch && <input type="hidden" name="search" value={currentSearch} />}
              {currentSortBy && <input type="hidden" name="sortBy" value={currentSortBy} />}

              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.75rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Filter size={18} style={{ color: "var(--primary)" }} />
                Bộ Lọc Nâng Cao
              </h3>

              {/* 1. Price Range */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  Khoảng Giá (VND)
                </label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input 
                    type="number" 
                    name="minPrice"
                    defaultValue={params.minPrice || ""}
                    placeholder="Từ"
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "6px",
                      background: "rgba(0,0,0,0.2)",
                      border: "1px solid var(--card-border)",
                      color: "#fff",
                      fontSize: "0.85rem",
                      outline: "none"
                    }}
                  />
                  <span style={{ color: "var(--text-muted)" }}>-</span>
                  <input 
                    type="number" 
                    name="maxPrice"
                    defaultValue={params.maxPrice || ""}
                    placeholder="Đến"
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "6px",
                      background: "rgba(0,0,0,0.2)",
                      border: "1px solid var(--card-border)",
                      color: "#fff",
                      fontSize: "0.85rem",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              {/* 2. Stock Availability */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input 
                  type="checkbox" 
                  id="inStockOnly"
                  name="inStockOnly"
                  value="true"
                  defaultChecked={inStockOnly}
                  style={{
                    cursor: "pointer",
                    accentColor: "var(--primary)"
                  }}
                />
                <label htmlFor="inStockOnly" style={{ fontSize: "0.85rem", fontWeight: 500, color: "#fff", cursor: "pointer" }}>
                  Chỉ hiển thị sách còn hàng
                </label>
              </div>

              {/* 3. Publishers Filter */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  Nhà Xuất Bản
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#fff", cursor: "pointer" }}>
                    <input 
                      type="radio" 
                      name="publisherId" 
                      value="" 
                      defaultChecked={!publisherId}
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <span>Tất cả nhà xuất bản</span>
                  </label>
                  {publishers.map((pub) => (
                    <label key={pub.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#fff", cursor: "pointer" }}>
                      <input 
                        type="radio" 
                        name="publisherId" 
                        value={pub.id} 
                        defaultChecked={publisherId === pub.id}
                        style={{ accentColor: "var(--primary)" }}
                      />
                      <span>{pub.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action buttons inside Advanced Filters form */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: "100%", padding: "0.6rem 1rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
                >
                  Áp dụng bộ lọc
                </button>
                <Link 
                  href="/products" 
                  className="btn btn-secondary" 
                  style={{ width: "100%", padding: "0.6rem 1rem", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                >
                  <RotateCcw size={14} />
                  Xóa bộ lọc
                </Link>
              </div>

            </form>
          </aside>

          {/* Right Column: Products Catalog Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            
            {products.length === 0 ? (
              <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center" }}>
                <BookOpen size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem", opacity: 0.5 }} />
                <h3 style={{ color: "#fff", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Không tìm thấy sách phù hợp</h3>
                <p style={{ color: "var(--text-muted)" }}>Hãy thử điều chỉnh các bộ lọc nâng cao hoặc từ khóa tìm kiếm.</p>
                <Link href="/products" className="btn btn-primary" style={{ marginTop: "1.5rem", display: "inline-flex" }}>
                  Xem tất cả sách
                </Link>
              </div>
            ) : (
              <>
                {/* Catalog Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "2rem" }}>
                  {products.map((product) => {
                    const authorName = product.authors[0]?.author.name || "Chưa rõ tác giả";
                    const categoryName = product.categories[0]?.category.name || "Chưa phân loại";
                    const imageUrl = product.images[0]?.url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e";

                    return (
                      <div key={product.id} className="book-card">
                        <Link href={`/products/${product.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%" }}>
                          <div className="book-cover-container">
                            <img src={imageUrl} alt={product.title} className="book-cover" />
                            <span className="book-category-tag">
                              <Tag size={10} />
                              {categoryName}
                            </span>
                          </div>
                          <h3 className="book-title">{product.title}</h3>
                          <p className="book-author">
                            <User size={12} style={{ display: "inline", marginRight: "4px" }} />
                            {authorName}
                          </p>
                          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.5rem" }}>
                            <span className="book-price">{product.price.toLocaleString("vi-VN")} đ</span>
                            <button className="btn btn-secondary add-to-cart-icon-btn" aria-label="Add to cart" style={{ pointerEvents: "none" }}>
                              <ShoppingBag size={14} />
                            </button>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Simple Pagination controls */}
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem" }}>
                  {currentPage > 1 && (
                    <Link
                      href={{
                        pathname: "/products",
                        query: { ...params, page: currentPage - 1 },
                      }}
                      className="btn btn-secondary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                    >
                      Trang trước
                    </Link>
                  )}
                  {products.length === itemsPerPage && (
                    <Link
                      href={{
                        pathname: "/products",
                        query: { ...params, page: currentPage + 1 },
                      }}
                      className="btn btn-secondary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                    >
                      Trang tiếp theo
                    </Link>
                  )}
                </div>
              </>
            )}

          </div>

        </div>

      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{
        __html: `
        @media (min-width: 1024px) {
          .products-layout-grid {
            grid-template-columns: 280px 1fr !important;
          }
        }

        .search-input-field:focus {
          border-color: var(--primary) !important;
          background: rgba(0, 0, 0, 0.4) !important;
          box-shadow: 0 0 0 2px var(--primary-glow) !important;
        }

        .sort-tab {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--card-border);
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .sort-tab:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
        }
        .active-sort-tab {
          color: #fff !important;
          background: var(--primary) !important;
          border-color: var(--primary) !important;
          box-shadow: 0 4px 12px var(--primary-glow);
        }

        .category-item-link {
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
          display: block;
        }
        .category-item-link:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.04);
        }
        .active-category-item {
          color: #fff !important;
          background: var(--primary-glow) !important;
          border-left: 3px solid var(--primary);
          padding-left: 0.75rem !important;
        }

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
        .book-category-tag {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(9, 9, 11, 0.75);
          backdrop-filter: blur(4px);
          border: 1px solid var(--card-border);
          color: var(--foreground);
          font-size: 0.65rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          z-index: 2;
        }
        
        .add-to-cart-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px !important;
          padding: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--card-border);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .add-to-cart-icon-btn:hover {
          background: var(--primary) !important;
          border-color: var(--primary) !important;
          color: #fff !important;
          transform: scale(1.05);
        }
      `
      }} />
    </div>
  );
}