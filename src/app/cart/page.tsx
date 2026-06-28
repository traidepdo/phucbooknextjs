import React from "react";
import { cookies } from "next/headers";
import Hearder from "@/components/public/Hearder";
import Footer from "@/components/public/Footer";
import { verifyJWT } from "@/lib/jwt";
import { prisma } from "@/lib/db";
import CartContainer from "@/components/cart/CartContainer";

export default async function CartPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  let user = null;
  let cartItems: any[] = [];

  if (token) {
    user = await verifyJWT(token);
    if (user) {
      cartItems = await prisma.cart.findMany({
        where: { userId: user.userId },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              price: true,
              stock: true,
              images: {
                take: 1,
                select: { url: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
    }
  }

  return (
    <div className="app-layout" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)", color: "var(--foreground)" }}>
      <Hearder />

      <main style={{ flex: 1, padding: "120px 0 60px 0", maxWidth: "1200px", margin: "0 auto", width: "100%", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
        
        {/* Title */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem", letterSpacing: "-0.03em" }}>
            Giỏ Hàng Của Bạn
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", fontWeight: 300 }}>
            {user ? `Quản lý các sản phẩm bạn đã thêm và tiến hành đặt hàng.` : "Vui lòng đăng nhập để xem giỏ hàng của bạn."}
          </p>
        </div>

        {/* Content container powered by interactive Client Component */}
        {!user ? (
          <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center", maxWidth: "600px", margin: "2rem auto" }}>
            <h3 style={{ color: "#fff", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Bạn chưa đăng nhập</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Đăng nhập để xem và quản lý giỏ hàng sách của bạn.</p>
            <a href="/login" className="btn btn-primary" style={{ padding: "0.8rem 2rem", textDecoration: "none" }}>
              Đăng Nhập Ngay
            </a>
          </div>
        ) : (
          <CartContainer initialCartItems={cartItems} />
        )}

      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 992px) {
          .cart-layout-grid {
            grid-template-columns: 1fr 340px !important;
          }
        }

        .cart-item-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--card-border);
          border-radius: 14px;
          padding: 1.25rem;
          transition: all 0.2s ease;
        }
        .cart-item-card:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.1);
        }
        .cart-item-cover-wrapper {
          width: 80px;
          height: 110px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .cart-item-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
          line-height: 1.3;
          transition: color 0.2s ease;
        }
        .cart-item-title:hover {
          color: var(--primary);
        }
        .cart-item-actions-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          font-size: 0.85rem;
        }
        .quantity-badge {
          color: var(--text-muted);
        }
        .quantity-badge strong {
          color: #fff;
        }
        .remove-item-btn:hover {
          color: var(--error) !important;
        }
        .hover-white:hover {
          color: #fff !important;
        }
      `}} />
    </div>
  );
}
