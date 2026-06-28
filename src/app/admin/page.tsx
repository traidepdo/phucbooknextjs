"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/public/Footer";
import { OrderStatus } from "@prisma/client";
import { 
  Shield, 
  Users, 
  LogOut, 
  Loader2, 
  Server, 
  Activity, 
  Database, 
  Package, 
  BookOpen, 
  CheckCircle,
  ExternalLink
} from "lucide-react";

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
}

interface AdminOrderItem {
  id: string;
  quantity: number;
  price: number;
  book: { title: string };
}

interface AdminOrder {
  id: string;
  code: string;
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  shippingAddress: string;
  createdAt: string;
  user: {
    email: string;
    name: string | null;
  };
  orderItems: AdminOrderItem[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminProfile, setAdminProfile] = useState<UserInfo | null>(null);
  
  // Tabs: 'users' | 'orders'
  const [activeTab, setActiveTab] = useState<"users" | "orders">("users");

  // Data lists
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [booksCount, setBooksCount] = useState(0);

  // Loading & states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Order status update loading state
  const [orderStatusLoadingMap, setOrderStatusLoadingMap] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    try {
      // 1. Fetch current profile
      const profileRes = await fetch("/api/auth/me");
      if (!profileRes.ok) {
        throw new Error("Failed to load session profile");
      }
      const profileData = await profileRes.json();
      
      if (profileData.user.role !== "ADMIN") {
        router.push("/dashboard?error=unauthorized");
        return;
      }
      setAdminProfile(profileData.user);

      // 2. Fetch Users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      // 3. Fetch Orders
      const ordersRes = await fetch("/api/admin/orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }

      // 4. Fetch Books count
      const booksRes = await fetch("/api/admin/books?limit=1");
      if (booksRes.ok) {
        const booksData = await booksRes.json();
        setBooksCount(booksData.totalCount || 0);
      }

    } catch (err: any) {
      setError(err.message);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  // Update Order Status Handler
  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    setOrderStatusLoadingMap(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus })
      });

      if (res.ok) {
        alert("Cập nhật trạng thái đơn hàng thành công!");
        // Refresh orders list
        const ordersRes = await fetch("/api/admin/orders");
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Gặp lỗi khi cập nhật.");
      }
    } catch (err) {
      console.error(err);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setOrderStatusLoadingMap(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusDetails = (status: OrderStatus) => {
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
          <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Đang tải trang quản trị viên...</p>
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

  if (error) {
    return (
      <div className="main-wrapper" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--error)" }}>Lỗi hệ thống: {error}</p>
      </div>
    );
  }

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
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>Quản Trị Viên PhucBook</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span className="badge badge-admin" style={{ display: "flex", gap: "0.25rem", alignItems: "center", fontWeight: "bold" }}>
            <Server size={12} /> Root Admin
          </span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", cursor: "pointer" }}>
            <LogOut size={16} /> Đăng Xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        width: "90%", 
        maxWidth: "1200px", 
        margin: "2rem auto", 
        display: "flex", 
        flexDirection: "column", 
        gap: "2rem" 
      }}>
        
        {/* KPI Panel */}
        <section style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
          gap: "1.5rem" 
        }}>
          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ padding: "0.75rem", borderRadius: "12px", background: "var(--primary-glow)", color: "var(--primary)" }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Tổng người dùng</p>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.25rem 0 0 0" }}>{users.length}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ padding: "0.75rem", borderRadius: "12px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
              <Package size={24} />
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Tổng đơn hàng</p>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.25rem 0 0 0" }}>{orders.length}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ padding: "0.75rem", borderRadius: "12px", background: "rgba(139, 92, 246, 0.15)", color: "#a78bfa" }}>
              <BookOpen size={24} />
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Tổng tựa sách</p>
              <h3 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.25rem 0 0 0" }}>{booksCount}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ padding: "0.75rem", borderRadius: "12px", background: "rgba(251, 191, 36, 0.1)", color: "#fbbf24" }}>
              <Database size={24} />
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Động cơ CSDL</p>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0.25rem 0 0 0" }}>PostgreSQL</h3>
            </div>
          </div>
        </section>

        {/* Tab Selector buttons */}
        <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem", alignItems: "center" }}>
          <button 
            onClick={() => setActiveTab("users")}
            className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
          >
            Quản Lý Thành Viên
          </button>
          <button 
            onClick={() => setActiveTab("orders")}
            className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`}
          >
            Quản Lý Đơn Hàng
          </button>
          <Link 
            href="/admin/books"
            className="admin-tab-btn"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
          >
            Quản Lý Kho Sách
            <ExternalLink size={14} />
          </Link>
        </div>

        {/* Tab Content 1: Users */}
        {activeTab === "users" && (
          <section className="glass-panel" style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
              Danh sách thành viên đăng ký
            </h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Tên người dùng</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Email</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Mã định danh (ID)</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Quyền hạn</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Ngày tham gia</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "1rem 0.75rem", fontWeight: 600 }}>{user.name || "N/A"}</td>
                      <td style={{ padding: "1rem 0.75rem" }}>{user.email}</td>
                      <td style={{ padding: "1rem 0.75rem", fontFamily: "monospace", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        {user.id}
                      </td>
                      <td style={{ padding: "1rem 0.75rem" }}>
                        <span className={user.role === "ADMIN" ? "badge badge-admin" : "badge badge-user"}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 0.75rem", color: "var(--text-muted)" }}>
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tab Content 2: Orders */}
        {activeTab === "orders" && (
          <section className="glass-panel" style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
              Danh sách đơn hàng toàn hệ thống
            </h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Mã đơn</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Khách hàng</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Sản phẩm mua</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Địa chỉ & Liên hệ</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Tổng tiền</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Ngày đặt</th>
                    <th style={{ padding: "1rem 0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                      <td style={{ padding: "1rem 0.75rem", fontWeight: 700, color: "#fff" }}>{order.code}</td>
                      <td style={{ padding: "1rem 0.75rem" }}>
                        <div style={{ fontWeight: 600 }}>{order.user.name || "N/A"}</div>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{order.user.email}</span>
                      </td>
                      <td style={{ padding: "1rem 0.75rem", maxWidth: "220px" }}>
                        {order.orderItems.map((item) => (
                          <div key={item.id} style={{ fontSize: "0.85rem", color: "var(--foreground)" }}>
                            - {item.book.title} (<strong>x{item.quantity}</strong>)
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: "1rem 0.75rem", fontSize: "0.8rem", color: "var(--text-muted)", maxWidth: "250px", wordBreak: "break-word" }}>
                        {order.shippingAddress}
                      </td>
                      <td style={{ padding: "1rem 0.75rem", fontWeight: 700, color: "var(--primary)" }}>
                        {order.total.toLocaleString("vi-VN")} đ
                      </td>
                      <td style={{ padding: "1rem 0.75rem", color: "var(--text-muted)" }}>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td style={{ padding: "1rem 0.75rem" }}>
                        <select
                          value={order.status}
                          disabled={orderStatusLoadingMap[order.id]}
                          onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                          style={{
                            background: "rgba(0,0,0,0.4)",
                            border: "1px solid var(--card-border)",
                            color: "#fff",
                            borderRadius: "6px",
                            padding: "0.35rem 0.5rem",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            outline: "none"
                          }}
                        >
                          <option value="PENDING" style={{ background: "#1c1917" }}>Chờ xử lý</option>
                          <option value="PROCESSING" style={{ background: "#1c1917" }}>Đang xử lý</option>
                          <option value="SHIPPED" style={{ background: "#1c1917" }}>Đang giao hàng</option>
                          <option value="DELIVERED" style={{ background: "#1c1917" }}>Đã giao hàng</option>
                          <option value="CANCELLED" style={{ background: "#1c1917" }}>Đã hủy đơn</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-tab-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 0.75rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border-bottom: 2px solid transparent;
        }
        .admin-tab-btn:hover {
          color: #fff;
        }
        .admin-tab-btn.active {
          color: var(--primary) !important;
          border-bottom-color: var(--primary);
        }

        .badge-admin {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
      `}} />
    </div>
  );
}
