"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

interface WishlistToggleProps {
  bookId: string;
}

export default function WishlistToggle({ bookId }: WishlistToggleProps) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if the book is in the wishlist
    fetch("/api/wishlist")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        if (data.wishlist) {
          const found = data.wishlist.some((item: any) => item.bookId === bookId);
          setIsWishlisted(found);
        }
      })
      .catch(() => setIsWishlisted(false));
  }, [bookId]);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const res = await fetch(`/api/wishlist?bookId=${bookId}`, {
          method: "DELETE"
        });
        if (res.ok) {
          setIsWishlisted(false);
          router.refresh();
        } else {
          alert("Lỗi khi xóa khỏi danh sách yêu thích.");
        }
      } else {
        // Add to wishlist
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId })
        });
        if (res.ok) {
          setIsWishlisted(true);
          router.refresh();
        } else {
          if (res.status === 401) {
            alert("Vui lòng đăng nhập để yêu thích sách.");
            router.push("/login");
          } else {
            alert("Lỗi khi thêm vào danh sách yêu thích.");
          }
        }
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      alert("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid var(--card-border)",
        color: isWishlisted ? "#ef4444" : "var(--text-muted)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        outline: "none"
      }}
      className="wishlist-detail-btn"
      title={isWishlisted ? "Xóa khỏi yêu thích" : "Yêu thích sách"}
    >
      <Heart size={22} fill={isWishlisted ? "#ef4444" : "none"} style={{ transition: "all 0.3s ease" }} />
      <style jsx global>{`
        .wishlist-detail-btn:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          color: #ef4444 !important;
          transform: scale(1.05);
        }
      `}</style>
    </button>
  );
}
