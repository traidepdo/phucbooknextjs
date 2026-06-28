"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BookOpen,
    ShoppingBag,
    Search,
    User,
    Heart,
    Menu,
    X,
    ChevronDown
} from "lucide-react";

export default function Header() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

    useEffect(() => {
        // Fetch user info
        fetch("/api/auth/me")
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Not logged in");
            })
            .then(data => {
                if (data.user) {
                    setUser(data.user);
                }
            })
            .catch(() => {
                setUser(null);
            });

        // Fetch categories list
        fetch("/api/categories")
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Failed to fetch");
            })
            .then(data => {
                if (data.categories) {
                    setCategories(data.categories);
                }
            })
            .catch(() => setCategories([]));
    }, []);

    // Refresh cart count on navigation or actions
    useEffect(() => {
        fetch("/api/cart")
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Failed to fetch");
            })
            .then(data => {
                if (data.cart) {
                    const count = data.cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
                    setCartCount(count);
                }
            })
            .catch(() => setCartCount(0));
    }, [pathname]);

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (res.ok) {
                setUser(null);
                setIsUserDropdownOpen(false);
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                width: "100%",
                background: "rgba(9, 9, 11, 0.8)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid var(--card-border)",
                transition: "all 0.3s ease",
            }}
        >
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "0 1.5rem",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1.5rem"
                }}
            >
                {/* Logo */}
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
                        <BookOpen size={22} style={{ color: "#fff" }} />
                    </div>
                    <span
                        style={{
                            fontSize: "1.4rem",
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

                {/* Desktop Navigation Links */}
                <nav
                    style={{
                        display: "none",
                        gap: "1.75rem",
                        alignItems: "center"
                    }}
                    className="md-flex"
                >
                    <Link href="/" className={`nav-item ${pathname === "/" ? "active-nav" : ""}`}>Trang Chủ</Link>
                    <div
                        onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                        onMouseLeave={() => setIsCategoryDropdownOpen(false)}
                        style={{ position: "relative", cursor: "pointer" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                            <span>Thể Loại</span>
                            <ChevronDown size={14} />
                        </div>
                        {isCategoryDropdownOpen && categories.length > 0 && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    paddingTop: "0.5rem",
                                    zIndex: 100
                                }}
                            >
                                <div
                                    style={{
                                        background: "rgba(20, 20, 25, 0.95)",
                                        backdropFilter: "blur(12px)",
                                        border: "1px solid var(--card-border)",
                                        borderRadius: "10px",
                                        width: "220px",
                                        padding: "0.5rem",
                                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.25rem"
                                    }}
                                >
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            href={`/products?category=${encodeURIComponent(cat.name)}`}
                                            className="dropdown-item"
                                            style={{ color: "#fff", textDecoration: "none", fontSize: "0.85rem", padding: "0.5rem", borderRadius: "6px", display: "block" }}
                                            onClick={() => setIsCategoryDropdownOpen(false)}
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <Link href="/products" className={`nav-item ${pathname === "/books" ? "active-nav" : ""}`}>Cửa Hàng</Link>
                    <Link href="/about" className={`nav-item ${pathname === "/about" ? "active-nav" : ""}`}>Giới Thiệu</Link>
                </nav>

                {/* Search Bar */}
                <form
                    action="/products"
                    method="GET"
                    style={{
                        display: "none",
                        position: "relative",
                        flex: 1,
                        maxWidth: "380px",
                    }}
                    className="md-block"
                >
                    <input
                        type="text"
                        name="search"
                        placeholder="Tìm sách, tác giả, ISBN..."
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        style={{
                            width: "100%",
                            padding: "0.6rem 1rem 0.6rem 2.5rem",
                            borderRadius: "9999px",
                            background: isSearchFocused ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.03)",
                            border: `1px solid ${isSearchFocused ? "var(--primary)" : "var(--card-border)"}`,
                            color: "var(--foreground)",
                            outline: "none",
                            fontSize: "0.9rem",
                            transition: "all 0.3s ease",
                        }}
                    />
                    <Search
                        size={16}
                        style={{
                            position: "absolute",
                            left: "1rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: isSearchFocused ? "var(--primary)" : "var(--text-muted)",
                            transition: "color 0.3s ease",
                            pointerEvents: "none"
                        }}
                    />
                </form>

                {/* Right Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {/* Wishlist */}
                    <Link
                        href="/wishlist"
                        style={{
                            color: "var(--text-muted)",
                            padding: "0.5rem",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease"
                        }}
                        className="action-icon-btn"
                    >
                        <Heart size={20} />
                    </Link>

                    {/* Cart */}
                    <Link
                        href="/cart"
                        style={{
                            color: "var(--text-muted)",
                            padding: "0.5rem",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            transition: "all 0.2s ease"
                        }}
                        className="action-icon-btn"
                    >
                        <ShoppingBag size={20} />
                        {cartCount > 0 && (
                            <span
                                style={{
                                    position: "absolute",
                                    top: "2px",
                                    right: "2px",
                                    background: "var(--primary)",
                                    color: "#fff",
                                    fontSize: "0.65rem",
                                    fontWeight: "bold",
                                    borderRadius: "50%",
                                    width: "16px",
                                    height: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 0 8px rgba(99, 102, 241, 0.6)"
                                }}
                            >
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    <div
                        style={{
                            width: "1px",
                            height: "20px",
                            background: "var(--card-border)",
                            margin: "0 0.25rem"
                        }}
                    />

                    {/* Account/Login Button */}
                    {user ? (
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="btn btn-secondary"
                                style={{
                                    padding: "0.5rem 1rem",
                                    fontSize: "0.85rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.4rem",
                                    cursor: "pointer"
                                }}
                            >
                                <User size={15} style={{ color: "var(--primary)" }} />
                                <span>{user.name || "Tài Khoản"}</span>
                                <ChevronDown size={12} />
                            </button>

                            {isUserDropdownOpen && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "100%",
                                        right: 0,
                                        marginTop: "0.5rem",
                                        background: "rgba(20, 20, 25, 0.95)",
                                        backdropFilter: "blur(12px)",
                                        border: "1px solid var(--card-border)",
                                        borderRadius: "10px",
                                        width: "180px",
                                        padding: "0.5rem",
                                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                                        zIndex: 100,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.25rem"
                                    }}
                                >
                                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "0.35rem 0.5rem", borderBottom: "1px solid var(--card-border)", marginBottom: "0.25rem" }}>
                                        {user.role === "ADMIN" ? "Quản Trị Viên" : "Khách Hàng"}
                                    </span>
                                    {user.role === "ADMIN" && (
                                        <Link
                                            href="/admin"
                                            className="dropdown-item"
                                            style={{ color: "#fff", textDecoration: "none", fontSize: "0.85rem", padding: "0.5rem", borderRadius: "6px", display: "block" }}
                                            onClick={() => setIsUserDropdownOpen(false)}
                                        >
                                            Trang Quản Trị
                                        </Link>
                                    )}
                                    <Link
                                        href="/dashboard"
                                        className="dropdown-item"
                                        style={{ color: "#fff", textDecoration: "none", fontSize: "0.85rem", padding: "0.5rem", borderRadius: "6px", display: "block" }}
                                        onClick={() => setIsUserDropdownOpen(false)}
                                    >
                                        Bảng Điều Khiển
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="dropdown-item logout-btn-item"
                                        style={{
                                            width: "100%",
                                            textAlign: "left",
                                            background: "none",
                                            border: "none",
                                            color: "var(--error)",
                                            fontSize: "0.85rem",
                                            padding: "0.5rem",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            transition: "background 0.2s"
                                        }}
                                    >
                                        Đăng Xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="btn btn-secondary"
                            style={{
                                padding: "0.5rem 1rem",
                                fontSize: "0.85rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem"
                            }}
                        >
                            <User size={15} />
                            <span>Đăng Nhập</span>
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "none",
                            border: "none",
                            color: "var(--foreground)",
                            cursor: "pointer",
                            padding: "0.5rem",
                        }}
                        className="md-hidden"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer Menu */}
            {isMobileMenuOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "80px",
                        left: 0,
                        width: "100%",
                        background: "rgba(9, 9, 11, 0.95)",
                        backdropFilter: "blur(16px)",
                        borderBottom: "1px solid var(--card-border)",
                        padding: "1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.25rem",
                        zIndex: 49
                    }}
                    className="md-hidden"
                >
                    {/* Mobile Search */}
                    <form action="/products" method="GET" style={{ position: "relative" }}>
                        <input
                            type="text"
                            name="search"
                            placeholder="Tìm sách..."
                            style={{
                                width: "100%",
                                padding: "0.6rem 1rem 0.6rem 2.5rem",
                                borderRadius: "8px",
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid var(--card-border)",
                                color: "var(--foreground)",
                                outline: "none",
                                fontSize: "0.9rem"
                            }}
                        />
                        <Search
                            size={16}
                            style={{
                                position: "absolute",
                                left: "1rem",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--text-muted)",
                            }}
                        />
                    </form>

                    {/* Mobile Links */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <Link href="/" style={{ color: "var(--foreground)", textDecoration: "none", fontSize: "1rem" }} onClick={() => setIsMobileMenuOpen(false)}>Trang Chủ</Link>
                        <Link href="/books" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "1rem" }} onClick={() => setIsMobileMenuOpen(false)}>Cửa Hàng Sách</Link>
                        <Link href="/bestsellers" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "1rem" }} onClick={() => setIsMobileMenuOpen(false)}>Sách Bán Chạy</Link>
                        <Link href="/about" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "1rem" }} onClick={() => setIsMobileMenuOpen(false)}>Giới Thiệu</Link>
                    </div>
                </div>
            )}

            {/* Embedded CSS for responsive behaviors */}
            <style jsx global>{`
        @media (min-width: 768px) {
          .md-flex {
            display: flex !important;
          }
          .md-block {
            display: block !important;
          }
          .md-hidden {
            display: none !important;
          }
        }
        .nav-item {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: color 0.2s ease;
          position: relative;
        }
        .nav-item:hover, .nav-dropdown-trigger:hover {
          color: var(--foreground) !important;
        }
        .active-nav {
          color: var(--foreground);
        }
        .active-nav::after {
          content: "";
          position: absolute;
          bottom: -6px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--primary);
          border-radius: 9999px;
          box-shadow: 0 0 8px var(--primary);
        }
        .action-icon-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--foreground) !important;
        }
        .dropdown-item {
          transition: all 0.2s ease;
        }
        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.06);
          padding-left: 0.75rem !important;
        }
        .logout-btn-item:hover {
          background: rgba(239, 68, 68, 0.1) !important;
          color: #ef4444 !important;
        }
      `}</style>
        </header>
    );
}