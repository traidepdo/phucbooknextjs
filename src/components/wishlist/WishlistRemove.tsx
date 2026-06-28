"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface WishlistRemoveProps {
  bookId: string;
}

export default function WishlistRemove({ bookId }: WishlistRemoveProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/wishlist?bookId=${bookId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Có lỗi xảy ra.");
      }
    } catch (error) {
      console.error("Remove wishlist item error:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRemove}
      disabled={loading}
      className="btn btn-secondary remove-wishlist-btn"
      style={{
        padding: "0.5rem",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--error)",
        borderColor: "rgba(239, 68, 68, 0.2)",
        background: "rgba(239, 68, 68, 0.05)",
        cursor: "pointer",
        opacity: loading ? 0.6 : 1
      }}
      title="Xóa khỏi yêu thích"
    >
      <Trash2 size={16} />
    </button>
  );
}
