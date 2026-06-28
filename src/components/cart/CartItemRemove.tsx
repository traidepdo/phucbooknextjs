"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface CartItemRemoveProps {
  id: string;
}

export default function CartItemRemove({ id }: CartItemRemoveProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/cart?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Có lỗi xảy ra khi xóa sản phẩm.");
      }
    } catch (error) {
      console.error("Remove item error:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRemove} 
      disabled={loading}
      className="remove-item-btn" 
      style={{
        background: "none",
        border: "none",
        color: "var(--text-muted)",
        fontSize: "0.8rem",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        transition: "color 0.2s ease",
        opacity: loading ? 0.5 : 1
      }}
    >
      <Trash2 size={14} style={{ marginRight: "4px" }} />
      {loading ? "Đang xóa..." : "Xóa"}
    </button>
  );
}
