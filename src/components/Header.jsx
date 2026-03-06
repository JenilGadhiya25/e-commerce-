import { IconBag, IconBell, IconHeart, IconSearch, IconUser, IconX } from "./icons/Icons.jsx";
import { useSearch } from "../search/SearchContext.jsx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { useCart } from "../cart/CartContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import arkLogo from "../assets/ark-logo.svg";
import { useWishlist } from "../wishlist/WishlistContext.jsx";
import { useNotifications } from "../notifications/useNotifications.js";
import { useProducts } from "../products/ProductsContext.jsx";

export default function Header() {
  const { query, setQuery, clear } = useSearch();
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useCart();
  const auth = useAuth();
  const wishlist = useWishlist();
  const { products } = useProducts();
  const notifications = useNotifications(auth.customer?.id);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isAdminRoute = location.pathname.startsWith("/admin");

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return products
      .filter((p) => p.title.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, products]);

  function onSubmit() {
    const q = query.trim();
    if (!q) return;
    if (location.pathname !== "/") navigate("/");
    setOpen(false);
    const scroll = () => document.getElementById("best-sellers")?.scrollIntoView({ behavior: "smooth", block: "start" });
    requestAnimationFrame(scroll);
    setTimeout(scroll, 120);
  }

  return (
    <header className="header">
      <div className="container header__inner">
        <Link className="logo" to="/" aria-label="ARK Packaging Enterprise Home">
          <img className="logo__img" src={arkLogo} alt="ARK Packaging Enterprise" />
        </Link>

        <div className="search" onBlur={() => setOpen(false)} onFocus={() => setOpen(true)}>
          <IconSearch className="search__icon" />
          <input
            className="search__input"
            type="search"
            placeholder="Search Product Here..."
            aria-label="Search products"
            value={query}
            ref={inputRef}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
              if (e.key === "Escape") {
                setOpen(false);
                inputRef.current?.blur?.();
              }
            }}
          />

          {query.trim() ? (
            <button
              className="search__clear"
              type="button"
              aria-label="Clear search"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                clear();
                inputRef.current?.focus?.();
              }}
            >
              <IconX />
            </button>
          ) : null}

          {open && query.trim() ? (
            <div className="searchResults" role="listbox" aria-label="Search results">
              {results.length ? (
                results.map((p) => {
                  const href = p.href || (p.kind === "custom" ? `/product/${p.id}` : "");
                  return href ? (
                    <Link
                      key={p.id}
                      className="searchResult"
                      to={href}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setOpen(false)}
                    >
                      <img className="searchResult__img" src={p.image} alt="" aria-hidden="true" />
                      <div className="searchResult__meta">
                        <div className="searchResult__title">{p.title}</div>
                        <div className="searchResult__price">₹{p.price.toFixed(2)}</div>
                      </div>
                    </Link>
                  ) : (
                    <button
                      key={p.id}
                      type="button"
                      className="searchResult searchResult--btn"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onSubmit()}
                    >
                      <img className="searchResult__img" src={p.image} alt="" aria-hidden="true" />
                      <div className="searchResult__meta">
                        <div className="searchResult__title">{p.title}</div>
                        <div className="searchResult__price">₹{p.price.toFixed(2)}</div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="searchEmpty">No matches found.</div>
              )}
            </div>
          ) : null}
        </div>

        <div className="headerIcons" aria-label="Quick actions">
          {!isAdminRoute ? (
            <button
              className={unreadCount ? "iconBtn iconBtn--badge" : "iconBtn"}
              type="button"
              aria-label="Notifications"
              onClick={() => {
                if (!auth.customer) {
                  navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                  return;
                }
                navigate("/notifications");
              }}
            >
              <IconBell />
              {unreadCount ? (
                <span className="badge" aria-label={`${unreadCount} unread notifications`}>
                  {unreadCount}
                </span>
              ) : null}
            </button>
          ) : null}
          <button
            className={wishlist.count ? "iconBtn iconBtn--badge" : "iconBtn"}
            type="button"
            aria-label="Wishlist"
            onClick={() => {
              if (!auth.customer) {
                navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                return;
              }
              wishlist.open();
            }}
          >
            <IconHeart />
            {wishlist.count ? (
              <span className="badge" aria-label={`${wishlist.count} items in wishlist`}>
                {wishlist.count}
              </span>
            ) : null}
          </button>
          <button
            className="iconBtn iconBtn--badge"
            type="button"
            aria-label="Cart"
            onClick={() => {
              if (!auth.customer) {
                navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                return;
              }
              cart.open();
            }}
          >
            <IconBag />
            <span className="badge" aria-label={`${cart.count} items in cart`}>
              {cart.count}
            </span>
          </button>
          <button
            className="iconBtn"
            type="button"
            aria-label="Profile"
            onClick={() => {
              if (!auth.customer) {
                navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                return;
              }
              setUserOpen((v) => !v);
            }}
          >
            <IconUser />
          </button>
          {auth.customer && userOpen ? (
            <div className="userMenu" role="dialog" aria-label="User details">
              <div className="userMenu__top">
                <div className="userMenu__title">Account</div>
                <button className="userMenu__close" type="button" aria-label="Close" onClick={() => setUserOpen(false)}>
                  <IconX />
                </button>
              </div>
              <div className="userMenu__body">
                <div className="userMenu__name">{auth.customer.name}</div>
                <div className="userMenu__meta">{auth.customer.email}</div>
                <div className="userMenu__meta">{auth.customer.phone}</div>
              </div>
              <button
                className="userMenu__logout"
                type="button"
                onClick={() => {
                  setUserOpen(false);
                  cart.close();
                  auth.logoutCustomer();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </div>
          ) : null}
          <a className="headerPhone" href="tel:+918200421794" aria-label="Call +91 82004 21794">
            +91 82004 21794
          </a>
        </div>
      </div>
    </header>
  );
}
