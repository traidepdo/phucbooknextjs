"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, X } from "lucide-react";

interface AddToCartProps {
  bookId: string;
  stock: number;
}

export default function AddToCart({ bookId, stock }: AddToCartProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form fields state
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  const handleAddToCart = async () => {
    if (stock <= 0) return;
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, quantity: 1 }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Đã thêm sách vào giỏ hàng thành công!");
        router.refresh();
      } else {
        if (res.status === 401) {
          alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
          router.push("/login");
        } else {
          alert(data.error || "Có lỗi xảy ra khi thêm vào giỏ hàng.");
        }
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim() || !shippingAddress.trim()) {
      alert("Vui lòng nhập đầy đủ tất cả các thông tin giao nhận hàng.");
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          buyNowBookId: bookId, 
          buyNowQuantity: 1,
          fullName,
          phoneNumber,
          shippingAddress
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Đặt hàng thành công! Mã đơn hàng của bạn: ${data.orderCode}`);
        setShowModal(false);
        router.push("/dashboard");
        router.refresh();
      } else {
        if (res.status === 401) {
          alert("Vui lòng đăng nhập để thực hiện mua ngay.");
          router.push("/login");
        } else {
          alert(data.error || "Có lỗi xảy ra khi đặt hàng.");
        }
      }
    } catch (error) {
      console.error("Buy now error:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "1rem", width: "100%", flexWrap: "wrap" }}>
      <button 
        onClick={handleAddToCart}
        disabled={stock <= 0 || loading}
        className="btn btn-primary" 
        style={{ 
          flex: 1, 
          minWidth: "200px", 
          padding: "0.9rem 2rem", 
          fontSize: "1rem", 
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.6rem",
          cursor: "pointer",
          opacity: (stock <= 0 || loading) ? 0.6 : 1
        }}
      >
        <ShoppingBag size={20} />
        {loading && !showModal ? "Đang xử lý..." : "Thêm Vào Giỏ Hàng"}
      </button>
      <button 
        onClick={() => setShowModal(true)}
        disabled={stock <= 0 || loading}
        className="btn btn-secondary buy-now-btn" 
        style={{ 
          flex: 1, 
          minWidth: "200px", 
          padding: "0.9rem 2rem", 
          fontSize: "1rem", 
          fontWeight: 600,
          background: "rgba(255, 255, 255, 0.05)",
          cursor: "pointer",
          opacity: (stock <= 0 || loading) ? 0.6 : 1
        }}
      >
        Mua Ngay
      </button>

      {/* Checkout Information Modal Overlay */}
      {showModal && (
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
            maxWidth: "480px",
            background: "rgba(20, 20, 25, 0.95)",
            border: "1px solid var(--card-border)",
            borderRadius: "16px",
            padding: "2rem",
            position: "relative",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)"
          }}>
            <button 
              onClick={() => setShowModal(false)}
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
              Thông Tin Giao Hàng
            </h3>

            <form onSubmit={handleBuyNowSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Họ và tên người nhận
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--card-border)",
                    color: "#fff",
                    outline: "none",
                    fontSize: "0.95rem"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Số điện thoại liên hệ
                </label>
                <input 
                  type="tel" 
                  required
                  placeholder="Ví dụ: 0912345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--card-border)",
                    color: "#fff",
                    outline: "none",
                    fontSize: "0.95rem"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Địa chỉ nhận hàng chi tiết
                </label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--card-border)",
                    color: "#fff",
                    outline: "none",
                    fontSize: "0.95rem",
                    resize: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: "0.75rem 1rem", cursor: "pointer" }}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: "0.75rem 1rem", fontWeight: 600, cursor: "pointer" }}
                >
                  {loading ? "Đang xử lý..." : "Xác Nhận Mua"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
