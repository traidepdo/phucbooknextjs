"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/public/Footer";
import { 
  Shield, 
  ArrowLeft, 
  Plus, 
  Search, 
  Save, 
  Edit2, 
  Loader2, 
  X, 
  Package, 
  Image as ImageIcon
} from "lucide-react";

interface AuthorMeta {
  id: string;
  name: string;
}

interface CategoryMeta {
  id: string;
  name: string;
}

interface PublisherMeta {
  id: string;
  name: string;
}

interface BookItem {
  id: string;
  title: string;
  price: number;
  stock: number;
  description: string | null;
  publisher: { id: string; name: string } | null;
  authors: { authorId: string; author: { name: string } }[];
  categories: { categoryId: string; category: { name: string } }[];
  images: { url: string }[];
}

export default function AdminBooksManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Search and Pagination states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Data lists
  const [books, setBooks] = useState<BookItem[]>([]);
  const [authors, setAuthors] = useState<AuthorMeta[]>([]);
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [publishers, setPublishers] = useState<PublisherMeta[]>([]);

  // Modals & Loaders
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states (shared between Add and Edit)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [publisherId, setPublisherId] = useState("");
  const [authorIds, setAuthorIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  const loadBooksData = async () => {
    setLoading(true);
    try {
      // 1. Verify user profile
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/login");
        return;
      }
      const meData = await meRes.json();
      if (meData.user.role !== "ADMIN") {
        router.push("/dashboard?error=unauthorized");
        return;
      }

      // 2. Fetch Paginated Books list
      const booksRes = await fetch(`/api/admin/books?page=${currentPage}&search=${encodeURIComponent(searchQuery)}&limit=10`);
      if (booksRes.ok) {
        const data = await booksRes.json();
        setBooks(data.books || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }

      // 3. Fetch Metadata for dropdown options
      const metaRes = await fetch("/api/admin/metadata");
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        setAuthors(metaData.authors || []);
        setCategories(metaData.categories || []);
        setPublishers(metaData.publishers || []);
      }
    } catch (err) {
      console.error("Load books data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooksData();
  }, [currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadBooksData();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
      } else {
        alert(data.error || "Lỗi tải ảnh lên.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Lỗi kết nối máy chủ khi tải ảnh.");
    } finally {
      setUploading(false);
    }
  };

  const openAddModal = () => {
    setSelectedBookId(null);
    setTitle("");
    setPrice("");
    setStock("");
    setDescription("");
    setPublisherId("");
    setAuthorIds([]);
    setCategoryIds([]);
    setImageUrl("");
    setShowAddModal(true);
  };

  const openEditModal = (book: BookItem) => {
    setSelectedBookId(book.id);
    setTitle(book.title);
    setPrice(book.price.toString());
    setStock(book.stock.toString());
    setDescription(book.description || "");
    setPublisherId(book.publisher?.id || "");
    setAuthorIds(book.authors.map(a => a.authorId));
    setCategoryIds(book.categories.map(c => c.categoryId));
    setImageUrl(book.images[0]?.url || "");
    setShowEditModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent, isEditMode: boolean) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      alert("Tiêu đề và giá sách là bắt buộc.");
      return;
    }
    setSubmitLoading(true);

    const url = "/api/admin/books";
    const method = isEditMode ? "PUT" : "POST";
    const bodyPayload = {
      bookId: selectedBookId,
      title,
      price: parseFloat(price),
      stock: parseInt(stock || "0", 10),
      description,
      publisherId: publisherId || null,
      authorIds,
      categoryIds,
      imageUrls: imageUrl ? [imageUrl] : ["/cover_echo.png"]
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });

      if (res.ok) {
        alert(isEditMode ? "Cập nhật sách thành công!" : "Thêm sách mới thành công!");
        setShowAddModal(false);
        setShowEditModal(false);
        loadBooksData();
      } else {
        const data = await res.json();
        alert(data.error || "Gặp lỗi khi lưu thông tin.");
      }
    } catch (error) {
      console.error(error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAuthorCheckboxChange = (id: string) => {
    setAuthorIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCategoryCheckboxChange = (id: string) => {
    setCategoryIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="app-layout" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)", color: "var(--foreground)" }}>
      {/* Header */}
      <header className="glass-panel" style={{ 
        margin: "1.5rem auto 0 auto", 
        width: "90%", 
        maxWidth: "1200px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "1rem 2rem",
        borderRadius: "12px",
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Shield size={24} style={{ color: "var(--primary)" }} />
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>Quản Lý Kho Sách</h1>
        </div>
        <Link href="/admin" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <ArrowLeft size={16} /> Quay lại trang Admin
        </Link>
      </header>

      {/* Main Container */}
      <main style={{ 
        flex: 1, 
        width: "90%", 
        maxWidth: "1200px", 
        margin: "2rem auto", 
        display: "flex", 
        flexDirection: "column", 
        gap: "1.5rem" 
      }}>
        
        {/* Actions bar: Search & Add Button */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ position: "relative", flex: 1, maxWidth: "450px" }}>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, mô tả, tác giả..."
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.75rem",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--card-border)",
                color: "var(--foreground)",
                outline: "none",
                fontSize: "0.9rem"
              }}
            />
            <button type="submit" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
              <Search size={18} />
            </button>
          </form>

          {/* Add Book Button */}
          <button 
            onClick={openAddModal}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", fontWeight: 600, cursor: "pointer" }}
          >
            <Plus size={18} />
            Thêm Sách Mới
          </button>
        </div>

        {/* Inventory list block */}
        {loading ? (
          <div style={{ display: "flex", padding: "6rem 0", justifyContent: "center" }}>
            <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
          </div>
        ) : books.length === 0 ? (
          <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <Package size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem", opacity: 0.5 }} />
            <h3 style={{ color: "#fff", fontSize: "1.25rem" }}>Không tìm thấy sách nào</h3>
            <p style={{ color: "var(--text-muted)" }}>Hãy thử điều chỉnh từ khóa tìm kiếm hoặc thêm mới tựa sách.</p>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500, width: "70px" }}>Bìa</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Thông tin tựa sách</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Thể loại & Tác giả</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Giá bán</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Tồn kho</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500, textAlign: "center" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => {
                    const bookCover = book.images[0]?.url || "/cover_echo.png";
                    const authorNames = book.authors.map(a => a.author.name).join(", ");
                    const categoryNames = book.categories.map(c => c.category.name).join(", ");

                    return (
                      <tr key={book.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        {/* Cover image column */}
                        <td style={{ padding: "1rem 0.75rem" }}>
                          <img 
                            src={bookCover} 
                            alt={book.title} 
                            style={{ width: "45px", height: "60px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--card-border)" }}
                          />
                        </td>
                        {/* Title details */}
                        <td style={{ padding: "1rem 0.75rem", maxWidth: "250px" }}>
                          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", margin: "0 0 0.25rem 0" }}>{book.title}</h4>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            NXB: {book.publisher?.name || "Chưa xác nhận"}
                          </span>
                        </td>
                        {/* Authors & Categories */}
                        <td style={{ padding: "1rem 0.75rem", maxWidth: "250px" }}>
                          <div style={{ color: "#fff", fontSize: "0.85rem" }}>{authorNames || "N/A"}</div>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{categoryNames || "N/A"}</span>
                        </td>
                        {/* Price */}
                        <td style={{ padding: "1rem 0.75rem", fontWeight: 700, color: "#fff" }}>
                          {book.price.toLocaleString("vi-VN")} đ
                        </td>
                        {/* Stock */}
                        <td style={{ padding: "1rem 0.75rem" }}>
                          <span style={{ color: book.stock === 0 ? "var(--error)" : "var(--text-muted)", fontWeight: 500 }}>
                            {book.stock === 0 ? "Hết hàng" : `${book.stock} cuốn`}
                          </span>
                        </td>
                        {/* Actions */}
                        <td style={{ padding: "1rem 0.75rem", textAlign: "center" }}>
                          <button
                            onClick={() => openEditModal(book)}
                            className="btn btn-secondary"
                            style={{
                              padding: "0.4rem 0.85rem",
                              fontSize: "0.8rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              cursor: "pointer"
                            }}
                          >
                            <Edit2 size={12} />
                            Sửa chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--card-border)" }}>
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                >
                  Trang trước
                </button>
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  Trang <strong>{currentPage}</strong> / {totalPages} (Tổng cộng: {totalCount})
                </span>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />

      {/* Shared Book Add / Edit Modal Overlay */}
      {(showAddModal || showEditModal) && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem"
        }}>
          <div className="glass-panel" style={{
            width: "100%",
            maxWidth: "600px",
            background: "rgba(20, 20, 25, 0.95)",
            border: "1px solid var(--card-border)",
            borderRadius: "16px",
            padding: "2rem",
            position: "relative",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)"
          }}>
            <button 
              onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
              style={{
                position: "absolute",
                top: "1.25rem",
                right: "1.25rem",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer"
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", margin: "0 0 1.5rem 0" }}>
              {showEditModal ? "Chỉnh Sửa Thông Tin Sách" : "Thêm Sách Mới Vào Hệ Thống"}
            </h3>

            <form onSubmit={(e) => handleFormSubmit(e, showEditModal)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              
              {/* Row 1: Title & Price */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Tiêu đề sách *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ví dụ: Đất Rừng Phương Nam"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.85rem", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--card-border)", color: "#fff", outline: "none", fontSize: "0.95rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Giá bán (VND) *
                  </label>
                  <input 
                    type="number" 
                    required
                    placeholder="Ví dụ: 120000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.85rem", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--card-border)", color: "#fff", outline: "none", fontSize: "0.95rem" }}
                  />
                </div>
              </div>

              {/* Row 2: Stock & Publisher */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Số lượng nhập kho
                  </label>
                  <input 
                    type="number"
                    placeholder="Ví dụ: 50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.85rem", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--card-border)", color: "#fff", outline: "none", fontSize: "0.95rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Nhà xuất bản
                  </label>
                  <select 
                    value={publisherId}
                    onChange={(e) => setPublisherId(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem 0.85rem", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--card-border)", color: "#fff", outline: "none", fontSize: "0.95rem", cursor: "pointer" }}
                  >
                    <option value="" style={{ background: "#1c1917" }}>-- Chọn nhà xuất bản --</option>
                    {publishers.map((pub) => (
                      <option key={pub.id} value={pub.id} style={{ background: "#1c1917" }}>{pub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Image Upload */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Ảnh bìa sách (Tải file ảnh lưu vào public) *
                </label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    id="book-image-file-input-modal"
                  />
                  <label 
                    htmlFor="book-image-file-input-modal"
                    className="btn btn-secondary"
                    style={{
                      padding: "0.6rem 1rem",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <ImageIcon size={16} />
                    {uploading ? "Đang tải ảnh lên..." : "Chọn File Ảnh"}
                  </label>
                  
                  {imageUrl && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <img 
                        src={imageUrl} 
                        alt="Preview" 
                        style={{ width: "40px", height: "55px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--card-border)" }}
                      />
                      <span style={{ fontSize: "0.75rem", color: "var(--success)" }}>Ảnh bìa đã chọn</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Tóm tắt nội dung sách
                </label>
                <textarea 
                  rows={3}
                  placeholder="Nhập giới thiệu ngắn hoặc tóm tắt sách..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", padding: "0.6rem 0.85rem", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--card-border)", color: "#fff", outline: "none", fontSize: "0.95rem", resize: "none" }}
                />
              </div>

              {/* Selection lists: Authors */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Chọn tác giả (có thể chọn nhiều)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", maxHeight: "110px", overflowY: "auto", padding: "0.5rem", border: "1px solid var(--card-border)", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
                  {authors.map((author) => (
                    <label key={author.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#fff", cursor: "pointer" }}>
                      <input 
                        type="checkbox"
                        checked={authorIds.includes(author.id)}
                        onChange={() => handleAuthorCheckboxChange(author.id)}
                        style={{ accentColor: "var(--primary)" }}
                      />
                      <span>{author.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Selection lists: Categories */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Chọn thể loại (có thể chọn nhiều)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", maxHeight: "110px", overflowY: "auto", padding: "0.5rem", border: "1px solid var(--card-border)", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
                  {categories.map((cat) => (
                    <label key={cat.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#fff", cursor: "pointer" }}>
                      <input 
                        type="checkbox"
                        checked={categoryIds.includes(cat.id)}
                        onChange={() => handleCategoryCheckboxChange(cat.id)}
                        style={{ accentColor: "var(--primary)" }}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button 
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: "0.75rem 1rem", cursor: "pointer" }}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={submitLoading}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: "0.75rem 1rem", fontWeight: 600, cursor: "pointer" }}
                >
                  {submitLoading ? "Đang lưu..." : "Xác nhận lưu"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
