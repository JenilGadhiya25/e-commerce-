import { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { IconCart, IconSearchPlus, IconStar, IconX } from "../components/icons/Icons.jsx";
import { useCart } from "../cart/CartContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useProducts } from "../products/ProductsContext.jsx";
import { uploadDesignImage } from "../uploads/uploadClient.js";

const defaultSizes = ["4x4", "6x8", "8x10", "10x12", "12x16", "12x14", "14x18"];
const defaultPackQty = ["100", "200", "300", "500", "1000"];
const defaultPrintColors = ["Premium Color", "Standard Color"];
const defaultColors = ["Black", "Blue", "Orange", "Pink", "Purple", "Red", "White"];

function formatINR(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return `₹${value}`;
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

function buildSchema(product) {
  const title = String(product?.title || "").toLowerCase();
  const id = String(product?.id || "").toLowerCase();
  const isPoly =
    title.includes("polyethylene") ||
    id.includes("polyethylene") ||
    title.includes("ldpe") ||
    id.includes("ldpe") ||
    title.includes("hdpe") ||
    id.includes("hdpe") ||
    title.includes("ll(d)pe") ||
    id.includes("ll(d)pe") ||
    title.includes("printed bag") ||
    id.includes("printed-bag");

  if (isPoly) {
    return {
      groups: [
        { key: "capacity", label: "Capacity", values: ["1kg", "2kg", "5kg"] },
        { key: "quantity", label: "Bag Quantity", values: ["100", "200", "500", "1000"] },
      ],
      defaults: { capacity: "1kg", quantity: "100" },
      showUpload: false,
      showColors: false,
      showPrintColor: false,
      showRating: false,
      reviewsText: "(0 Customer Reviews)",
    };
  }

  return {
    groups: [
      { key: "size", label: "Bag Size", values: defaultSizes },
      { key: "pack", label: "Bag Quantity", values: defaultPackQty },
    ],
    defaults: { size: defaultSizes[0], pack: defaultPackQty[0], print: "Standard Color", color: "White" },
    showUpload: true,
    showColors: true,
    showPrintColor: true,
    showRating: true,
    reviewsText: "(3 Customer Reviews)",
  };
}

function computeTierPrice(product, options) {
  const pricing = product?.pricing;
  if (!pricing || typeof pricing !== "object") return null;

  const opts = options || {};

  // 1) Rule-based matching: pricing.rules = [{ when: {...}, price, original }]
  if (Array.isArray(pricing.rules)) {
    for (const r of pricing.rules) {
      if (!r || typeof r !== "object") continue;
      const when = r.when && typeof r.when === "object" ? r.when : null;
      if (!when) continue;
      const ok = Object.entries(when).every(([k, v]) => String(opts[k] ?? "") === String(v));
      if (!ok) continue;
      const price = Number(r.price);
      const original = r.original === undefined || r.original === null ? null : Number(r.original);
      if (Number.isFinite(price) && price >= 0) {
        return { price, original: Number.isFinite(original) && original >= 0 ? original : null };
      }
    }
  }

  // 2) Quantity map: pricing.quantity = { "100": 120, "200": 220 }
  const qtyKey = opts.quantity ?? opts.pack;
  if (pricing.quantity && typeof pricing.quantity === "object" && qtyKey !== undefined) {
    const val = pricing.quantity[String(qtyKey)];
    const price = Number(val);
    if (Number.isFinite(price) && price >= 0) {
      const original = pricing.originalQuantity ? Number(pricing.originalQuantity[String(qtyKey)]) : null;
      return { price, original: Number.isFinite(original) && original >= 0 ? original : null };
    }
  }

  return null;
}

function computePolyFallbackPrice(product, options) {
  const title = String(product?.title || "").toLowerCase();
  const id = String(product?.id || "").toLowerCase();
  const isPoly =
    title.includes("polyethylene") ||
    id.includes("polyethylene") ||
    title.includes("ldpe") ||
    id.includes("ldpe") ||
    title.includes("hdpe") ||
    id.includes("hdpe") ||
    title.includes("printed bag") ||
    id.includes("printed-bag");
  if (!isPoly) return null;

  const opts = options || {};
  const basePrice = Number(product?.price);
  const baseOriginal = product?.original === undefined || product?.original === null ? null : Number(product.original);
  if (!Number.isFinite(basePrice) || basePrice < 0) return null;

  const qtyRaw = opts.quantity ?? opts.pack;
  const qty = Number(qtyRaw);
  const capRaw = String(opts.capacity ?? "");
  const capKg = Number(capRaw.replace(/[^0-9.]/g, "")) || 1;

  // Assumption: product.price represents the 1kg + 100 bags baseline.
  const qtyFactor = Number.isFinite(qty) && qty > 0 ? qty / 100 : 1;
  const capFactor = Number.isFinite(capKg) && capKg > 0 ? capKg : 1;

  const price = Math.max(0, basePrice * qtyFactor * capFactor);
  const original = Number.isFinite(baseOriginal) && baseOriginal !== null ? Math.max(0, baseOriginal * qtyFactor * capFactor) : null;
  return { price, original };
}

export default function DynamicProductDetailPage() {
  const { productId } = useParams();
  const { products } = useProducts();
  const cart = useCart();
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dialogRef = useRef(null);
  const fileRef = useRef(null);

  const product = useMemo(() => {
    const id = String(productId || "");
    return products.find((p) => p.id === id) || null;
  }, [products, productId]);

  const schema = useMemo(() => buildSchema(product), [product]);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [uploadState, setUploadState] = useState("idle"); // idle | uploading | success | error
  const [uploadError, setUploadError] = useState("");
  const [designUpload, setDesignUpload] = useState(null); // {id,url,filename}

  const [opts, setOpts] = useState(() => ({ ...(schema.defaults || {}) }));

  const tier = useMemo(() => computeTierPrice(product, opts), [product, opts]);
  const polyFallback = useMemo(() => computePolyFallbackPrice(product, opts), [product, opts]);
  const displayPrice = tier?.price ?? polyFallback?.price ?? Number(product.price || 0);
  const displayOriginal = tier?.original ?? polyFallback?.original ?? (product.original ?? null);

  const images = useMemo(() => {
    const img = product?.image || "/products/polyethylene-bag.svg";
    return [img, img, img, img, img];
  }, [product]);

  const sku = useMemo(() => {
    if (!product) return "";
    const parts = [product.id];
    for (const [k, v] of Object.entries(opts || {})) parts.push(`${k}:${v}`);
    return parts.join(" • ");
  }, [product, opts]);

  const cartOptions = useMemo(() => {
    const next = { ...(opts || {}) };
    if (designUpload?.id) next.designUploadId = designUpload.id;
    if (designUpload?.filename) next.designFilename = designUpload.filename;
    return next;
  }, [opts, designUpload]);

  function openZoom() {
    dialogRef.current?.showModal?.();
  }

  function closeZoom() {
    dialogRef.current?.close?.();
  }

  if (!product) {
    return (
      <section className="productPage" aria-label="Product detail">
        <div className="container">
          <div className="breadcrumb" aria-label="Breadcrumb">
            <Link className="breadcrumb__item" to="/">
              Home
            </Link>
            <span className="breadcrumb__sep">/</span>
            <span className="breadcrumb__item breadcrumb__item--active">Product not found</span>
          </div>

          <div className="pdTabs">
            <div className="adminEmpty">This product is not available.</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="productPage" aria-label="Product detail">
      <div className="container">
        <div className="breadcrumb" aria-label="Breadcrumb">
          <Link className="breadcrumb__item" to="/">
            Home
          </Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__item">Products</span>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__item breadcrumb__item--active">{product.title}</span>
        </div>

        <div className="pdGrid">
          <div className="pdLeft">
            <div className="pdMedia" aria-label="Product image preview">
              <button className="zoomBtn" type="button" aria-label="Zoom image" onClick={openZoom}>
                <IconSearchPlus />
              </button>
              <img className="pdImg" src={images[activeImg]} alt={product.title} />
            </div>

            <div className="pdThumbs" aria-label="Product thumbnails">
              {images.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  className={i === activeImg ? "pdThumb pdThumb--active" : "pdThumb"}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  aria-label={`Thumbnail ${i + 1}`}
                >
                  <img className="pdThumb__img" src={img} alt="" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className="pdRight">
            <h1 className="pdTitle">{product.title}</h1>

            {schema.showRating ? (
              <div className="pdRating">
                <div className="pdStars" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar key={i} />
                  ))}
                </div>
                <a className="pdReviewsLink" href="#" aria-label={schema.reviewsText}>
                  {schema.reviewsText}
                </a>
              </div>
            ) : null}

            <div className="pdRange">
              {displayOriginal ? (
                <>
                  <span style={{ textDecoration: "line-through", opacity: 0.55, marginRight: 10 }}>
                    {formatINR(displayOriginal)}
                  </span>
                  <span>{formatINR(displayPrice)}</span>
                </>
              ) : (
                <span>{formatINR(displayPrice)}</span>
              )}
            </div>
            <div className="pdNote">Shipping And GST Calculated At Checkout.</div>

            <div className="pdOptions" aria-label="Product options">
              {schema.groups.map((g) => (
                <OptionGroup key={g.key} label={`${g.label} : ${opts[g.key] || g.values[0]}`}>
                  {g.values.map((v) => (
                    <button
                      key={v}
                      className={v === opts[g.key] ? "pill pill--active" : "pill"}
                      type="button"
                      onClick={() => setOpts((s) => ({ ...s, [g.key]: v }))}
                      aria-pressed={v === opts[g.key]}
                    >
                      {v}
                    </button>
                  ))}
                </OptionGroup>
              ))}

              {schema.showPrintColor ? (
                <div className="optionRow">
                  <div className="optionLabel">
                    Print Color : <span className="optionValue">{opts.print || "Standard Color"}</span>
                  </div>
                  <div className="pillRow">
                    {defaultPrintColors.map((p) => (
                      <button
                        key={p}
                        className={p === (opts.print || "Standard Color") ? "pill pill--active" : "pill"}
                        type="button"
                        onClick={() => setOpts((s) => ({ ...s, print: p }))}
                        aria-pressed={p === (opts.print || "Standard Color")}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button className="clearLink" type="button" onClick={() => setOpts((s) => ({ ...s, print: "Standard Color" }))}>
                    Clear
                  </button>
                </div>
              ) : null}

              {schema.showColors ? (
                <div className="optionRow">
                  <div className="optionLabel">Choose Color</div>
                  <div className="colorRow" aria-label="Choose color">
                    {defaultColors.map((c) => (
                      <button
                        key={c}
                        className={c === (opts.color || "White") ? "colorPill colorPill--active" : "colorPill"}
                        type="button"
                        onClick={() => setOpts((s) => ({ ...s, color: c }))}
                        aria-pressed={c === (opts.color || "White")}
                      >
                        <span className={`colorDot colorDot--${c.toLowerCase()}`} aria-hidden="true" />
                        <span>{c}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="pdPrice" aria-label="Discounted price">
              {displayOriginal ? <span className="pdPrice__orig">{formatINR(displayOriginal)}</span> : null}
              <span className="pdPrice__now">{formatINR(displayPrice)}</span>
            </div>

            {schema.showUpload ? (
              <div
                className={
                  uploadState === "success"
                    ? "uploadBox uploadBox--success"
                    : uploadState === "error"
                      ? "uploadBox uploadBox--error"
                      : "uploadBox"
                }
                aria-label="Upload an image"
              >
                <div className="uploadLabel">Upload an image :</div>
                <label className="uploadCtl">
                  <input
                    ref={fileRef}
                    className="uploadInput"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0] || null;
                      if (!file) return;
                      if (!auth.customer) {
                        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                        return;
                      }
                      setUploadError("");
                      setUploadState("uploading");
                      setDesignUpload(null);
                      try {
                        const res = await uploadDesignImage({ file, customerId: auth.customer.id });
                        if (!res?.ok) {
                          setUploadState("error");
                          setUploadError(res?.error || "Upload failed.");
                          return;
                        }
                        setDesignUpload(res.upload);
                        setUploadState("success");
                      } catch {
                        setUploadState("error");
                        setUploadError("Upload failed.");
                      }
                    }}
                  />
                  <span className="uploadBtn">Choose file</span>
                  <span className="uploadHint">
                    {uploadState === "uploading"
                      ? "Uploading..."
                      : uploadState === "success"
                        ? "Uploaded"
                        : designUpload?.filename
                          ? designUpload.filename
                          : "No file chosen"}
                  </span>
                </label>
                {uploadState === "success" && designUpload?.id ? (
                  <button
                    className="clearLink"
                    type="button"
                    onClick={() => {
                      setDesignUpload(null);
                      setUploadState("idle");
                      setUploadError("");
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    Clear Upload
                  </button>
                ) : null}
                {uploadState === "error" && uploadError ? <div className="uploadErr">{uploadError}</div> : null}
              </div>
            ) : null}

            <div className="pdBuyRow">
              <div className="qtyCtl" aria-label="Quantity selector">
                <button className="qtyBtn" type="button" onClick={() => setQty((v) => Math.max(1, v - 1))} aria-label="Decrease quantity">
                  −
                </button>
                <div className="qtyVal" aria-label={`Quantity ${qty}`}>
                  {qty}
                </div>
                <button className="qtyBtn" type="button" onClick={() => setQty((v) => v + 1)} aria-label="Increase quantity">
                  +
                </button>
              </div>

              <button
                className="primaryBuyBtn"
                type="button"
                onClick={() => {
                  cart.addItem(
                    { ...product, price: displayPrice, original: displayOriginal ?? product.original },
                    { qty, options: cartOptions },
                  );
                }}
              >
                Add To Cart
              </button>
            </div>

            <div className="pdActions">
              <a className="waBuyBtn" href="https://wa.me/918200421794" target="_blank" rel="noreferrer">
                Order on WhatsApp
              </a>
              <button
                className="primaryBuyBtn primaryBuyBtn--alt"
                type="button"
                onClick={() => {
                  if (!auth.customer) {
                    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                    return;
                  }
                  cart.addItem(
                    { ...product, price: displayPrice, original: displayOriginal ?? product.original },
                    { qty, options: cartOptions, openDrawer: true },
                  );
                }}
              >
                Buy Now
              </button>
            </div>

            <div className="pdMeta" aria-label="Product information">
              <div className="pdMetaRow">
                <span className="pdMetaKey">SKU</span>
                <span className="pdMetaVal">{sku}</span>
              </div>
              <div className="pdMetaRow">
                <span className="pdMetaKey">Category</span>
                <span className="pdMetaVal">Custom Products</span>
              </div>
            </div>
          </div>
        </div>

        <section className="descSection" aria-label="Product description">
          <h2 className="descTitle">Description</h2>
          <p className="descIntro">
            {String(product.title || "").toLowerCase().includes("polyethylene")
              ? "Plain polyethylene bags for packaging and daily use."
              : "High-quality packaging product with customizable options."}
          </p>
        </section>

        <section className="bestSellers" aria-label="Related products" style={{ marginTop: 18 }}>
          <div className="container" style={{ padding: 0 }}>
            <div className="sectionTitle">
              <h2 className="sectionTitle__text">Related products</h2>
              <div className="sectionTitle__underline" aria-hidden="true" />
            </div>
            <div className="productGrid">
              {products
                .filter((p) => p.id !== product.id && p.featured)
                .slice(0, 3)
                .map((p) => (
                  <article key={p.id} className="productCard">
                    <div className="productCard__media">
                      <img className="productCard__img" src={p.image} alt={p.title} loading="lazy" />
                    </div>
                    <div className="productCard__body">
                      <h3 className="productCard__title" title={p.title}>
                        {p.title}
                      </h3>
                      <div className="priceRow">
                        <span className="priceRow__original">₹{Number(p.original || p.price || 0).toFixed(2)}</span>
                        <span className="priceRow__price">₹{Number(p.price || 0).toFixed(2)}</span>
                      </div>
                      {p.kind === "custom" ? (
                        <Link className="cartBtn" to={p.href || `/product/${p.id}`} aria-label="Select options">
                          <IconCart className="cartBtn__icon" />
                          <span>Select options</span>
                        </Link>
                      ) : (
                        <button className="cartBtn" type="button" onClick={() => cart.addItem(p, { qty: 1 })}>
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

        <dialog ref={dialogRef} className="zoomDialog" aria-label="Image zoom">
          <div className="zoomDialog__inner">
            <button className="zoomClose" type="button" onClick={closeZoom} aria-label="Close zoom">
              <IconX />
            </button>
            <img className="zoomImg" src={images[activeImg]} alt={`${product.title} zoomed`} />
          </div>
        </dialog>
      </div>
    </section>
  );
}

function OptionGroup({ label, children }) {
  return (
    <div className="optionRow">
      <div className="optionLabel">{label}</div>
      <div className="pillRow">{children}</div>
    </div>
  );
}
