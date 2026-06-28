"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Hearder from "@/components/public/Hearder";
import Footer from "@/components/public/Footer";
import { 
  User, 
  LogOut, 
  Loader2, 
  Calendar, 
  Mail, 
  Shield, 
  ShoppingBag, 
  Package,
  MapPin,
  CheckCircle,
  Star,
  MessageSquare,
  X
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  book: {
    id: string;
    title: string;
    images: { url: string }[];
  };
}

interface Order {
  id: string;
  code: string;
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  shippingAddress: string;
  createdAt: string;
  orderItems: OrderItem[];
}

interface UserReview {
  id: string;
  bookId: string;
  rating: number;
  comment: string | null;
}

export default function UserDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review Modal States
  const [selectedBook, setSelectedBook] = useState<{ id: string; title: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  // Status simulation loading
  const [statusLoadingMap, setStatusLoadingMap] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    try {
      // Fetch user profile
      const profileRes = await fetch("/api/auth/me");
      if (!profileRes.ok) {
        throw new Error("Failed to load user profile");
      }
      const profileData = await profileRes.json();
      setProfile(profileData.user);

      // Fetch user orders
      const ordersRes = await fetch("/api/orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders);
      }

      // Fetch user reviews
      const reviewsRes = await fetch("/api/reviews");
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setUserReviews(reviewsData.reviews || []);
      }
    } catch (err: any) {
      setError(err.message);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleConfirmReceipt = async (orderId: string) => {
    if (statusLoadingMap[orderId]) return;
    setStatusLoadingMap(prev => ({ ...prev, [orderId]: true }));

    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "DELIVERED" })
      });

      if (res.ok) {
        alert("Xác nhận đã nhận hàng thành công! Bây giờ bạn có thể đánh giá sản phẩm.");
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Gặp lỗi khi xác nhận nhận hàng.");
      }
    } catch (error) {
      console.error("Confirm receipt error:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setStatusLoadingMap(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    if (reviewSubmitLoading) return;
    setReviewSubmitLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBook.id,
          rating: reviewRating,
          comment: reviewComment
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Cảm ơn bạn đã gửi đánh giá cho sản phẩm!");
        setSelectedBook(null);
        setReviewComment("");
        setReviewRating(5);
        fetchData();
      } else {
        alert(data.error || "Lỗi khi gửi đánh giá.");
      }
    } catch (error) {
      console.error("Submit review error:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const getStatusDetails = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return {
          text: "Chờ xử lý",
          style: { background: "rgba(249, 115, 22, 0.15)", color: "#f97316", border: "1px solid rgba(249, 115, 22, 0.3)" }
        };
      case "PROCESSING":
        return {
          text: "Đang xử lý",
          style: { background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", border: "1px solid rgba(59, 130, 246, 0.3)" }
        };
      case "SHIPPED":
        return {
          text: "Đang giao hàng",
          style: { background: "rgba(168, 85, 247, 0.15)", color: "#a855f7", border: "1px solid rgba(168, 85, 247, 0.3)" }
        };
      case "DELIVERED":
        return {
          text: "Đã giao",
          style: { background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)" }
        };
      case "CANCELLED":
        return {
          text: "Đã hủy",
          style: { background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)" }
        };
      default:
        return {
          text: status,
          style: { background: "rgba(255, 255, 255, 0.05)", color: "#fff", border: "1px solid var(--card-border)" }
        };
    }
  };

  if (loading) {
    return (
      <div className="main-wrapper" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={36} className="animate-spin" style={{ color: "var(--primary)", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Đang tải bảng điều khiển...</p>
        </div>
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="main-wrapper" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--error)" }}>Lỗi: {error || "Không tìm thấy phiên đăng nhập."}</p>
      </div>
    );
  }

  return (
    <div className="app-layout" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)", color: "var(--foreground)" }}>
      <Hearder />

      <main style={{ flex: 1, padding: "120px 0 60px 0", maxWidth: "1200px", margin: "0 auto", width: "100%", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }} className="dashboard-grid">
          
          {/* Left Column: User Profile Card */}
          <aside>
            <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", height: "fit-content" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ 
                  width: "80px", 
                  height: "80px", 
                  borderRadius: "50%", 
                  background: "var(--primary-glow)", 
                  color: "var(--primary)",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  marginBottom: "1rem",
                  border: "1px solid rgba(99,102,241,0.2)"
                }}>
                  <User size={36} />
                </div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", margin: "0 0 0.25rem 0" }}>
                  {profile.name || "Người dùng PhucBook"}
                </h2>
                <span className="badge badge-user" style={{ fontSize: "0.7rem", fontWeight: "bold" }}>
                  {profile.role} ACCOUNT
                </span>
              </div>

              <div style={{ height: "1px", background: "var(--card-border)" }}></div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-muted)" }}>
                  <Mail size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  <span style={{ color: "var(--foreground)", wordBreak: "break-all" }}>{profile.email}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--text-muted)" }}>
                  <Calendar size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  <span>Ngày tham gia:</span>
                  <strong style={{ color: "#fff", marginLeft: "auto" }}>
                    {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
                  </strong>
                </div>
              </div>

              <button 
                onClick={handleLogout} 
                className="btn btn-secondary" 
                style={{ 
                  width: "100%", 
                  padding: "0.65rem 1rem", 
                  fontSize: "0.9rem", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "0.5rem",
                  cursor: "pointer"
                }}
              >
                <LogOut size={16} /> Đăng Xuất
              </button>
            </div>
          </aside>

          {/* Right Column: Order Management panel */}
          <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="glass-panel" style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: "0 0 1.5rem 0", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Package size={24} style={{ color: "var(--primary)" }} />
                Quản Lý Đơn Hàng ({orders.length})
              </h2>

              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)" }}>
                  <ShoppingBag size={48} style={{ margin: "0 auto 1.5rem auto", opacity: 0.3 }} />
                  <h4 style={{ color: "#fff", fontSize: "1.1rem", marginBottom: "0.5rem" }}>Bạn chưa mua đơn hàng nào</h4>
                  <p style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}>Đơn hàng bạn đặt mua sẽ hiển thị lịch sử và trạng thái ở đây.</p>
                  <Link href="/products" className="btn btn-primary" style={{ display: "inline-flex" }}>
                    Mua sách ngay
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {orders.map((order) => {
                    const statusInfo = getStatusDetails(order.status);
                    
                    return (
                      <div key={order.id} className="order-history-card">
                        {/* Order Header Info */}
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center", 
                          flexWrap: "wrap", 
                          gap: "0.75rem",
                          borderBottom: "1px solid var(--card-border)",
                          paddingBottom: "1rem",
                          marginBottom: "1rem"
                        }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>{order.code}</span>
                              <span style={{ 
                                fontSize: "0.75rem", 
                                fontWeight: 600, 
                                padding: "0.25rem 0.6rem", 
                                borderRadius: "6px",
                                textTransform: "uppercase",
                                ...statusInfo.style 
                              }}>
                                {statusInfo.text}
                              </span>
                            </div>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                              Đặt ngày: {new Date(order.createdAt).toLocaleDateString("vi-VN")} lúc {new Date(order.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Tổng tiền:</span>
                              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>
                                {order.total.toLocaleString("vi-VN")} đ
                              </div>
                            </div>
                            
                            {/* Confirmation Receipt Button if Pending/Processing/Shipped */}
                            {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                              <button
                                onClick={() => handleConfirmReceipt(order.id)}
                                disabled={statusLoadingMap[order.id]}
                                className="btn btn-primary"
                                style={{
                                  padding: "0.5rem 0.85rem",
                                  fontSize: "0.8rem",
                                  fontWeight: 600,
                                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                  border: "none",
                                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                                  cursor: "pointer",
                                  opacity: statusLoadingMap[order.id] ? 0.7 : 1
                                }}
                              >
                                {statusLoadingMap[order.id] ? "Đang xử lý..." : "Đã Nhận Hàng"}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Order Items list */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
                          {order.orderItems.map((item) => {
                            const bookCover = item.book.images[0]?.url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e";
                            
                            // Check if reviewed
                            const hasReviewed = userReviews.some(r => r.bookId === item.book.id);
                            const reviewItem = userReviews.find(r => r.bookId === item.book.id);

                            return (
                              <div key={item.id} style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                                <img 
                                  src={bookCover} 
                                  alt={item.book.title} 
                                  style={{ width: "45px", height: "60px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--card-border)" }} 
                                />
                                <div style={{ flex: 1, minWidth: "150px" }}>
                                  <Link href={`/products/${item.book.id}`} style={{ textDecoration: "none" }}>
                                    <h5 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff", margin: 0 }} className="hover-primary-text">
                                      {item.book.title}
                                    </h5>
                                  </Link>
                                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                    Đơn giá: {item.price.toLocaleString("vi-VN")} đ
                                  </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                                  <div style={{ fontSize: "0.9rem" }}>
                                    <span style={{ color: "var(--text-muted)" }}>Số lượng:</span> <strong>x{item.quantity}</strong>
                                  </div>

                                  {/* Review Interaction Block */}
                                  {order.status === "DELIVERED" && (
                                    <div style={{ minWidth: "110px", textAlign: "right" }}>
                                      {hasReviewed ? (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                          <div style={{ display: "flex", color: "#facc15" }}>
                                            {[...Array(5)].map((_, i) => (
                                              <Star 
                                                key={i} 
                                                size={12} 
                                                fill={i < (reviewItem?.rating || 5) ? "#facc15" : "none"} 
                                                stroke="currentColor" 
                                              />
                                            ))}
                                          </div>
                                          <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 500 }}>
                                            Đã đánh giá
                                          </span>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setSelectedBook({ id: item.book.id, title: item.book.title })}
                                          className="btn btn-secondary"
                                          style={{
                                            padding: "0.35rem 0.75rem",
                                            fontSize: "0.75rem",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "0.3rem",
                                            border: "1px solid rgba(99, 102, 241, 0.3)",
                                            color: "var(--primary)",
                                            cursor: "pointer"
                                          }}
                                        >
                                          <MessageSquare size={12} />
                                          Đánh Giá
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Shipping Address Footer */}
                        <div style={{ 
                          background: "rgba(0,0,0,0.15)", 
                          padding: "0.75rem 1rem", 
                          borderRadius: "8px", 
                          fontSize: "0.85rem",
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                          color: "var(--text-muted)"
                        }}>
                          <MapPin size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                          <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            Giao tới: {order.shippingAddress}
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </section>

        </div>

      </main>

      <Footer />

      {/* Review Submission Modal overlay */}
      {selectedBook && (
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
            maxWidth: "460px",
            background: "rgba(20, 20, 25, 0.95)",
            border: "1px solid var(--card-border)",
            borderRadius: "16px",
            padding: "2rem",
            position: "relative",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)"
          }}>
            <button 
              onClick={() => setSelectedBook(null)}
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

            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", margin: "0 0 0.5rem 0" }}>
              Đánh Giá Sản Phẩm
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 1.5rem 0", lineHeight: 1.4 }}>
              Bạn đang đánh giá cuốn sách: <strong style={{ color: "#fff" }}>{selectedBook.title}</strong>
            </p>

            <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Star Rating Selection */}
              <div style={{ textAlign: "center" }}>
                <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem", fontWeight: 600 }}>
                  Chọn mức độ hài lòng của bạn
                </span>
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        background: "none",
                        border: "none",
                        color: star <= reviewRating ? "#facc15" : "var(--text-muted)",
                        cursor: "pointer",
                        outline: "none",
                        padding: "0.25rem"
                      }}
                    >
                      <Star size={32} fill={star <= reviewRating ? "#facc15" : "none"} stroke="currentColor" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text area */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Viết nhận xét của bạn
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Hãy chia sẻ suy nghĩ của bạn về nội dung, chất lượng in ấn hay thiết kế của cuốn sách này nhé..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--card-border)",
                    color: "#fff",
                    outline: "none",
                    fontSize: "0.95rem",
                    resize: "none",
                    lineHeight: 1.4
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: "0.75rem 1rem", cursor: "pointer" }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitLoading}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: "0.75rem 1rem", fontWeight: 600, cursor: "pointer" }}
                >
                  {reviewSubmitLoading ? "Đang gửi..." : "Gửi Đánh Giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 280px 1fr !important;
          }
        }

        .hover-underline:hover {
          text-decoration: underline !important;
        }

        .hover-primary-text:hover {
          color: var(--primary) !important;
        }

        .order-history-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 1.25rem;
          transition: all 0.2s ease;
        }
        .order-history-card:hover {
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
        }
      `}} />
    </div>
  );
}
