"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, ShieldCheck, CreditCard, Trash2, X } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  book: {
    id: string;
    title: string;
    price: number;
    stock: number;
    images: { url: string }[];
  };
}

interface CartContainerProps {
  initialCartItems: CartItem[];
}

export default function CartContainer({ initialCartItems }: CartContainerProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(
    initialCartItems.map(item => item.id) // Select all by default
  );
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [removeLoadingMap, setRemoveLoadingMap] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);

  // Form fields state
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  useEffect(() => {
    setCartItems(initialCartItems);
    // Keep selection of items that still exist in the updated cart
    setSelectedItemIds(prev => prev.filter(id => initialCartItems.some(item => item.id === id)));
  }, [initialCartItems]);

  // Calculations
  const selectedItems = cartItems.filter(item => selectedItemIds.includes(item.id));
  const subtotal = selectedItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const shipping = subtotal === 0 ? 0 : subtotal > 300000 ? 0 : 30000;
  const total = subtotal + shipping;

  const handleSelectToggle = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllToggle = () => {
    if (selectedItemIds.length === cartItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(cartItems.map(item => item.id));
    }
  };

  const handleRemoveItem = async (id: string) => {
    if (removeLoadingMap[id]) return;
    setRemoveLoadingMap(prev => ({ ...prev, [id]: true }));

    try {
      const res = await fetch(`/api/cart?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        // Refresh server data
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Có lỗi xảy ra khi xóa sản phẩm.");
      }
    } catch (error) {
      console.error("Remove item error:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setRemoveLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemIds.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }
    if (!fullName.trim() || !phoneNumber.trim() || !shippingAddress.trim()) {
      alert("Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.");
      return;
    }
    if (checkoutLoading) return;
    setCheckoutLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cartItemIds: selectedItemIds,
          fullName,
          phoneNumber,
          shippingAddress
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Thanh toán thành công! Mã đơn hàng của bạn: ${data.orderCode}`);
        setShowModal(false);
        router.push("/dashboard");
        router.refresh();
      } else {
        alert(data.error || "Thanh toán thất bại.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "600px", margin: "2rem auto" }}>
        <ShoppingBag size={48} style={{ color: "var(--text-muted)", marginBottom: "1.5rem", opacity: 0.3 }} />
        <h3 style={{ color: "#fff", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Giỏ hàng của bạn đang trống</h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Hãy quay lại cửa hàng để chọn cho mình những tựa sách hay nhất.</p>
        <Link href="/products" className="btn btn-primary" style={{ padding: "0.8rem 2rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <ArrowLeft size={16} /> Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="cart-layout-grid">
      
      {/* Left Column: Cart Items List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        
        {/* Select All Bar */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: "1rem 1.25rem", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            fontSize: "0.9rem"
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", color: "#fff" }}>
            <input 
              type="checkbox" 
              checked={selectedItemIds.length === cartItems.length && cartItems.length > 0}
              onChange={handleSelectAllToggle}
              style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--primary)" }}
            />
            <span>Chọn tất cả ({cartItems.length} sản phẩm)</span>
          </label>
          <span style={{ color: "var(--text-muted)" }}>
            Đã chọn {selectedItemIds.length} sản phẩm
          </span>
        </div>

        {/* List of Cart Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {cartItems.map((item) => {
            const book = item.book;
            const imageUrl = book.images[0]?.url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e";
            const isChecked = selectedItemIds.includes(item.id);

            return (
              <div key={item.id} className="cart-item-card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                {/* Checkbox Selector */}
                <input 
                  type="checkbox" 
                  checked={isChecked}
                  onChange={() => handleSelectToggle(item.id)}
                  style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--primary)", flexShrink: 0 }}
                  title="Chọn thanh toán"
                />

                {/* Cover Image */}
                <div className="cart-item-cover-wrapper" style={{ flexShrink: 0 }}>
                  <img src={imageUrl} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <Link href={`/products/${book.id}`} style={{ textDecoration: "none" }}>
                    <h4 className="cart-item-title">{book.title}</h4>
                  </Link>
                  <div className="cart-item-actions-row" style={{ marginTop: "0.5rem" }}>
                    <div className="quantity-badge">
                      Số lượng: <strong>{item.quantity}</strong>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={removeLoadingMap[item.id]}
                      className="remove-item-btn" 
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        transition: "color 0.2s ease",
                        opacity: removeLoadingMap[item.id] ? 0.5 : 1
                      }}
                    >
                      <Trash2 size={14} style={{ marginRight: "4px" }} />
                      {removeLoadingMap[item.id] ? "Đang xóa..." : "Xóa"}
                    </button>
                  </div>
                </div>

                {/* Price columns */}
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "0.25rem", flexShrink: 0 }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: isChecked ? "var(--primary)" : "#fff" }}>
                    {(book.price * item.quantity).toLocaleString("vi-VN")} đ
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Đơn giá: {book.price.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", marginTop: "0.5rem" }} className="hover-white">
          <ArrowLeft size={16} />
          Tiếp tục mua sắm
        </Link>
      </div>

      {/* Right Column: Checkout Details Panel */}
      <div className="sidebar-checkout-container">
        <div className="glass-panel" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.75rem", margin: 0 }}>
            Thông Tin Đơn Hàng
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.95rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Đã chọn:</span>
              <strong style={{ color: "#fff" }}>{selectedItemIds.length} sản phẩm</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Tạm tính:</span>
              <strong style={{ color: "#fff" }}>{subtotal.toLocaleString("vi-VN")} đ</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Phí vận chuyển:</span>
              <strong style={{ color: "#fff" }}>
                {shipping === 0 ? "Miễn phí" : `${shipping.toLocaleString("vi-VN")} đ`}
              </strong>
            </div>
            {shipping > 0 && subtotal > 0 && (
              <span style={{ fontSize: "0.75rem", color: "var(--primary)" }}>
                * Mua thêm {(300000 - subtotal).toLocaleString("vi-VN")} đ để được miễn phí vận chuyển!
              </span>
            )}
          </div>

          <div style={{ height: "1px", background: "var(--card-border)" }}></div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>Tổng cộng:</span>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>
              {total.toLocaleString("vi-VN")} đ
            </span>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            disabled={selectedItemIds.length === 0}
            className="btn btn-primary" 
            style={{ 
              width: "100%", 
              padding: "0.85rem 1.5rem", 
              fontSize: "1rem", 
              fontWeight: 600,
              cursor: "pointer",
              opacity: selectedItemIds.length === 0 ? 0.6 : 1
            }}
          >
            Thanh Toán Ngay
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", borderTop: "1px solid var(--card-border)", paddingTop: "1rem", marginTop: "0.5rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <ShieldCheck size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
              <span>Thanh toán an toàn với chứng chỉ SSL bảo mật.</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <CreditCard size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
              <span>Hỗ trợ thẻ tín dụng, chuyển khoản ngân hàng, ví điện tử.</span>
            </div>
          </div>

        </div>
      </div>

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

            <form onSubmit={handleCheckoutSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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
                  disabled={checkoutLoading}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: "0.75rem 1rem", fontWeight: 600, cursor: "pointer" }}
                >
                  {checkoutLoading ? "Đang xử lý..." : "Xác Nhận Thanh Toán"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
