"use client";

import React from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Mail, 
  Phone, 
  MapPin, 
  Send
} from "lucide-react";

export default function Footer() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Cảm ơn bạn đã đăng ký nhận bản tin!");
  };

  return (
    <footer 
      style={{
        width: "100%",
        background: "rgba(20, 20, 25, 0.4)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid var(--card-border)",
        padding: "5rem 0 2rem 0",
        marginTop: "auto"
      }}
    >
      <div 
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem",
        }}
      >
        {/* Main Footer Links & Info */}
        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2.5rem",
            marginBottom: "4rem"
          }}
        >
          {/* Brand Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <Link 
              href="/" 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.5rem",
                textDecoration: "none" 
              }}
            >
              <div 
                style={{
                  background: "linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)",
                  padding: "0.5rem",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)"
                }}
              >
                <BookOpen size={20} style={{ color: "#fff" }} />
              </div>
              <span 
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.03em"
                }}
              >
                Phuc<span style={{ color: "var(--primary)", WebkitTextFillColor: "initial" }}>Book</span>
              </span>
            </Link>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: "1.6" }}>
              Nơi kết nối tri thức và độc giả. Chúng tôi cung cấp những tựa sách chất lượng nhất với đa dạng thể loại phù hợp với mọi lứa tuổi.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <a href="#" className="social-icon" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="social-icon" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: "#fff", fontSize: "1rem", fontWeight: 600, marginBottom: "1.25rem" }}>Khám Phá</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <li><Link href="/books" className="footer-link">Tất Cả Sách</Link></li>
              <li><Link href="/bestsellers" className="footer-link">Sách Bán Chạy</Link></li>
              <li><Link href="/new-releases" className="footer-link">Sách Mới Xuất Bản</Link></li>
              <li><Link href="/deals" className="footer-link">Khuyến Mãi Hot</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ color: "#fff", fontSize: "1rem", fontWeight: 600, marginBottom: "1.25rem" }}>Hỗ Trợ Khách Hàng</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <li><Link href="/faq" className="footer-link">Câu Hỏi Thường Gặp</Link></li>
              <li><Link href="/shipping" className="footer-link">Chính Sách Vận Chuyển</Link></li>
              <li><Link href="/returns" className="footer-link">Chính Sách Đổi Trả</Link></li>
              <li><Link href="/contact" className="footer-link">Liên Hệ Chúng Tôi</Link></li>
            </ul>
          </div>

          {/* Contact Details & Newsletter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h4 style={{ color: "#fff", fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem" }}>Bản Tin PhucBook</h4>
            <form onSubmit={handleSubmit} style={{ position: "relative" }}>
              <input 
                type="email" 
                placeholder="Nhập email của bạn..." 
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 2.75rem 0.75rem 1rem",
                  borderRadius: "8px",
                  background: "rgba(0, 0, 0, 0.2)",
                  border: "1px solid var(--card-border)",
                  color: "var(--foreground)",
                  fontSize: "0.85rem",
                  outline: "none",
                  transition: "all 0.2s ease"
                }}
                className="newsletter-input"
              />
              <button 
                type="submit" 
                style={{
                  position: "absolute",
                  right: "4px",
                  top: "4px",
                  bottom: "4px",
                  background: "var(--primary)",
                  border: "none",
                  borderRadius: "6px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                className="newsletter-btn"
              >
                <Send size={14} />
              </button>
            </form>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={16} style={{ color: "var(--primary)" }} />
                <span>123 Đường Sách, Quận 1, TP. HCM</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Phone size={16} style={{ color: "var(--primary)" }} />
                <span>+84 123 456 789</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Mail size={16} style={{ color: "var(--primary)" }} />
                <span>contact@phucbook.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--card-border)", marginBottom: "2rem" }}></div>

        {/* Bottom copyright */}
        <div 
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            fontSize: "0.85rem",
            color: "var(--text-muted)"
          }}
          className="md-row"
        >
          <span>© 2026 PhucBook. Bảo lưu mọi quyền.</span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/terms" className="footer-link">Điều Khoản Dịch Vụ</Link>
            <Link href="/privacy" className="footer-link">Chính Sách Bảo Mật</Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (min-width: 768px) {
          .md-row {
            flex-direction: row !important;
          }
        }
        .footer-link {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s ease, padding-left 0.2s ease;
        }
        .footer-link:hover {
          color: var(--foreground) !important;
          padding-left: 4px;
        }
        .social-icon {
          display: flex;
          alignItems: center;
          justifyContent: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--card-border);
          color: var(--text-muted);
          transition: all 0.3s ease;
        }
        .social-icon:hover {
          background: var(--primary-glow);
          border-color: var(--primary);
          color: var(--foreground) !important;
          transform: translateY(-2px);
        }
        .newsletter-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--primary-glow);
        }
        .newsletter-btn:hover {
          transform: scale(1.05);
          background: var(--primary-hover);
        }
      `}</style>
    </footer>
  );
}
