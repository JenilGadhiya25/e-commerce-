import { Link } from "react-router-dom";
import { IconCart, IconHeart, IconStar } from "./icons/Icons.jsx";
import { useSearch } from "../search/SearchContext.jsx";
import { useCart } from "../cart/CartContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useWishlist } from "../wishlist/WishlistContext.jsx";
import { useProducts } from "../products/ProductsContext.jsx";

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export default function BestSellersSection() {
  const { query, clear } = useSearch();
  const cart = useCart();
  const auth = useAuth();
  const wishlist = useWishlist();
  const { products: allProducts } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  const q = normalize(query);
  const products = q ? allProducts.filter((p) => normalize(p.title).includes(q)) : allProducts;

  return (
    <section className="bestSellers" aria-label="Our Best Sellers" id="best-sellers">
      <div className="container">
        <div className="sectionTitle">
          <h2 className="sectionTitle__text">Our Best Sellers</h2>
          <div className="sectionTitle__underline" aria-hidden="true" />
        </div>

        {q ? (
          <div className="resultsMeta" aria-label="Search results info">
            <span>
              Showing results for <span className="resultsMeta__q">“{query.trim()}”</span> ({products.length})
            </span>
            <button className="resultsMeta__clear" type="button" onClick={clear}>
              Clear
            </button>
          </div>
        ) : null}

        <div className="productGrid">
          {products.length === 0 ? (
            <div className="noResults" aria-label="No results">
              No products found. Try a different search.
            </div>
          ) : null}
          {products.map((p) => (
            <article key={p.title} className="productCard">
              <div className="productCard__media">
                <button
                  className="wishBtn"
                  type="button"
                  aria-label="Add to wishlist"
                  onClick={() => {
                    if (!auth.customer) {
                      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                      return;
                    }
                    wishlist.toggle(p);
                  }}
                >
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
                  <span className="priceRow__original">₹{p.original.toFixed(2)}</span>
                  <span className="priceRow__price">₹{p.price.toFixed(2)}</span>
                </div>

                {p.kind === "custom" ? (
                  <Link className="cartBtn" to={p.href || `/product/${p.id}`} aria-label="Select options">
                    <IconCart className="cartBtn__icon" />
                    <span>Select Options</span>
                  </Link>
                ) : (
                  <button
                    className="cartBtn"
                    type="button"
                    aria-label="Add to cart"
                    onClick={() => {
                      cart.addItem(p, { qty: 1 });
                    }}
                  >
                    <IconCart className="cartBtn__icon" />
                    <span>Add To Cart</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
