import { useMemo, useState } from "react";
import { IconCart, IconHeart, IconStar } from "../components/icons/Icons.jsx";
import { useCart } from "../cart/CartContext.jsx";
import { useWishlist } from "../wishlist/WishlistContext.jsx";

function inr(value) {
  return `₹${value.toFixed(2)}`;
}

function makeThumb({ size, pod }) {
  const [w, h] = String(size).split("x");
  const title = pod ? "POD" : "NON-POD";
  const podText = pod ? "With POD" : "Without POD";
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="520" height="520" viewBox="0 0 520 520">
    <defs>
      <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="1" stop-color="#f2f4f6"/>
      </linearGradient>
      <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.12"/>
      </filter>
    </defs>

    <rect x="0" y="0" width="520" height="520" fill="#ffffff"/>

    <g filter="url(#s)">
      <rect x="155" y="80" rx="18" ry="18" width="210" height="290" fill="url(#g)" stroke="#cfd6de" stroke-width="2"/>
      <rect x="155" y="80" rx="18" ry="18" width="210" height="40" fill="#eef2f6" stroke="#cfd6de" stroke-width="2"/>
      <rect x="160" y="90" width="200" height="16" rx="8" fill="#d7dde6"/>
    </g>

    ${pod ? `<rect x="205" y="170" width="110" height="96" rx="10" fill="#ffffff" stroke="#d2dbe5" stroke-width="2"/>
    <path d="M218 190h84M218 210h70M218 230h60" stroke="#9aa7b6" stroke-width="4" stroke-linecap="round"/>` : ""}

    <g opacity="0.92">
      <path d="M120 355h280" stroke="#adb8c6" stroke-width="4" stroke-linecap="round"/>
      <path d="M120 355v-14M400 355v-14" stroke="#adb8c6" stroke-width="4" stroke-linecap="round"/>
      <text x="260" y="392" text-anchor="middle" font-family="Inter, Poppins, system-ui" font-size="22" font-weight="700" fill="#566170">${w || ""}”</text>
    </g>

    <g opacity="0.92">
      <path d="M395 92v300" stroke="#adb8c6" stroke-width="4" stroke-linecap="round"/>
      <path d="M395 92h14M395 392h14" stroke="#adb8c6" stroke-width="4" stroke-linecap="round"/>
      <text x="440" y="250" text-anchor="middle" font-family="Inter, Poppins, system-ui" font-size="22" font-weight="700" fill="#566170" transform="rotate(90 440 250)">${h || ""}”</text>
    </g>

    <g>
      <rect x="38" y="26" rx="999" width="108" height="38" fill="${pod ? "#eaf2ff" : "#f2f4f7"}" stroke="${pod ? "#2a7de1" : "#cfd6de"}" stroke-width="2"/>
      <text x="92" y="52" text-anchor="middle" font-family="Inter, Poppins, system-ui" font-size="16" font-weight="800" fill="${pod ? "#2a7de1" : "#5b6675"}">${title}</text>
    </g>

    <text x="260" y="468" text-anchor="middle" font-family="Inter, Poppins, system-ui" font-size="20" font-weight="800" fill="#2a7de1">${size} ${podText}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const allProducts = [
  { size: "6.5x8", pod: false, price: 21.9, original: 27.36, rating: true },
  { size: "6.5x8", pod: true, price: 22.28, original: 27.78 },
  { size: "8x10", pod: false, price: 22.82, original: 28.44 },
  { size: "8x10", pod: true, price: 23.3, original: 29.88 },
  { size: "10x12", pod: false, price: 24.12, original: 41.7 },
  { size: "10x12", pod: true, price: 24.68, original: 35.24 },
  { size: "10x14", pod: false, price: 24.7, original: 47.74 },
  { size: "10x14", pod: true, price: 25.24, original: 35.32 },
  { size: "12x14", pod: false, price: 55.64, original: 88.25 },
  { size: "12x14", pod: true, price: 66.3, original: 65.4 },
  { size: "12x16", pod: false, price: 63.36, original: 64.46 },
  { size: "12x16", pod: true, price: 77.0, original: 77.32 },
  { size: "14x16", pod: false, price: 77.4, original: 83.88 },
  { size: "14x16", pod: true, price: 88.18, original: 98.22 },
  { size: "14x18", pod: false, price: 88.24, original: 89.02 },
  { size: "14x18", pod: true, price: 99.0, original: 110.0 },
].map((p) => {
  const podText = p.pod ? "With POD" : "Without POD";
  const title = `${p.size} Inches Secure Temper Proof White Courier Bag ${podText}`;
  return {
    id: `white-${p.size}-${p.pod ? "pod" : "nonpod"}`.replaceAll(".", "_"),
    title,
    size: p.size,
    pod: p.pod,
    price: p.price,
    original: p.original,
    image: makeThumb({ size: p.size, pod: p.pod }),
    rating: p.rating ? 5 : 0,
    kind: "standard",
  };
});

export default function WhiteCourierBagsPage() {
  const cart = useCart();
  const wishlist = useWishlist();
  const [page, setPage] = useState(1);
  const perPage = 16;
  const totalPages = Math.max(1, Math.ceil(allProducts.length / perPage));

  const products = useMemo(() => {
    const start = (page - 1) * perPage;
    return allProducts.slice(start, start + perPage);
  }, [page]);

  return (
    <section className="whiteBagsPage" aria-label="White courier bags">
      <div className="container">
        <div className="sectionTitle">
          <h2 className="sectionTitle__text">White Courier Bags</h2>
          <div className="sectionTitle__underline" aria-hidden="true" />
        </div>

        <div className="productGrid" aria-label="White courier bag products">
          {products.map((p) => (
            <article key={p.id} className="productCard">
              <div className="productCard__media">
                <button className="wishBtn" type="button" aria-label="Add to wishlist" onClick={() => wishlist.toggle(p)}>
                  <IconHeart />
                </button>
                <img className="productCard__img" src={p.image} alt={p.title} loading="lazy" />
              </div>

              <div className="productCard__body">
                <h3 className="productCard__title" title={p.title}>
                  {p.title}
                </h3>

                {p.rating ? (
                  <div className="rating" aria-label={`${p.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IconStar key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="rating rating--spacer" aria-hidden="true" />
                )}

                <div className="priceRow" aria-label="Price">
                  <span className="priceRow__original">{inr(p.original)}</span>
                  <span className="priceRow__price">{inr(p.price)}</span>
                </div>

                <button
                  className="cartBtn"
                  type="button"
                  aria-label="Add to cart"
                  onClick={() => cart.addItem(p, { qty: 1 })}
                >
                  <IconCart className="cartBtn__icon" />
                  <span>Add To Cart</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="pager" aria-label="Pagination">
          <button
            className="pager__btn"
            type="button"
            aria-label="Page 1"
            data-active={page === 1 ? "true" : "false"}
            onClick={() => {
              setPage(1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            1
          </button>
          {totalPages > 1 ? (
            <button
              className="pager__btn"
              type="button"
              aria-label="Page 2"
              data-active={page === 2 ? "true" : "false"}
              onClick={() => {
                setPage(2);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              2
            </button>
          ) : null}
          {totalPages > 2 ? (
            <button
              className="pager__btn pager__btn--next"
              type="button"
              aria-label="Next page"
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              →
            </button>
          ) : null}
        </div>

        <div className="plainInfo" aria-label="White courier bags information">
          <p>
            You Have Finally Launched Your Online Store. Everything—The Website, The Design, And The Product Images—Is
            Perfect For An Unforgettable Customer Experience.
          </p>
          <p>
            But Wait! Have You Got Your{" "}
            <a className="inlineLink" href="#">
              Packaging Materials
            </a>{" "}
            Sorted?
          </p>
          <p>
            Product Shipping Is A Critical Juncture In The Customer’s Journey. It Greatly Impacts The Buyer’s Purchasing
            Decision, Causing A Ripple Effect For Your Revenues.
          </p>
          <p>Having Solid And High-Quality Packaging Material Becomes Crucial.</p>
          <button className="plainReadMore" type="button">
            Read More
          </button>
        </div>
      </div>
    </section>
  );
}
