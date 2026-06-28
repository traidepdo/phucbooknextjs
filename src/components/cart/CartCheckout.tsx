"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartCheckout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Thanh toán thành công! Mã đơn hàng: ${data.orderCode}`);
        router.push("/dashboard");
        router.refresh();
      } else {
        alert(data.error || "Thanh toán thất bại.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout} 
      disabled={loading}
      className="btn btn-primary" 
      style={{ 
        width: "100%", 
        padding: "0.85rem 1.5rem", 
        fontSize: "1rem", 
        fontWeight: 600,
        cursor: "pointer",
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? "Đang xử lý thanh toán..." : "Thanh Toán Ngay"}
    </button>
  );
}
