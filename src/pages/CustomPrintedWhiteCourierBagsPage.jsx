import { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import whiteBag from "../assets/custom-printed-white.svg";
import pinkBag from "../assets/custom-printed-pink.svg";
import purpleBag from "../assets/custom-printed-purple.svg";
import blackBag from "../assets/custom-printed-black.svg";
import { IconCart, IconHeart, IconSearchPlus, IconStar, IconWhatsapp, IconX } from "../components/icons/Icons.jsx";
import { useCart } from "../cart/CartContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useWishlist } from "../wishlist/WishlistContext.jsx";

const sizes = ["6.5x8", "8x10", "10x12", "10x14", "12x16", "12x14", "14x16", "14x18", "16x20", "20x24", "22x30", "28x24"];
const qtyPacks = ["100", "200", "300", "500"];
const printColors = ["Premium Color", "Standard Color"];
const pockets = ["With Pocket", "Without Pocket"];

function formatINR(value) {
  return value.toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

export default function CustomPrintedWhiteCourierBagsPage() {
  const cart = useCart();
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("6.5x8");
  const [printColor, setPrintColor] = useState("Standard Color");
  const [pocket, setPocket] = useState("Without Pocket");
  const [qtyPack, setQtyPack] = useState("100");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("Description");
  const dialogRef = useRef(null);

  const range = useMemo(() => ({ min: 790, max: 11315 }), []);

  const computedPrice = useMemo(() => {
    const sizeIdx = Math.max(0, sizes.indexOf(size));
    const packIdx = Math.max(0, qtyPacks.indexOf(qtyPack));
    const sizeNorm = clamp01(sizeIdx / Math.max(1, sizes.length - 1));
    const packNorm = clamp01(packIdx / Math.max(1, qtyPacks.length - 1));
    const weight = 0.58 * sizeNorm + 0.42 * packNorm;
    const pocketUpcharge = pocket === "With Pocket" ? 0.04 : 0;
    const premiumUpcharge = printColor === "Premium Color" ? 0.05 : 0;
    const base = range.min + (range.max - range.min) * (weight + pocketUpcharge + premiumUpcharge);
    return Math.round(base * 100) / 100;
  }, [pocket, printColor, qtyPack, range.max, range.min, size]);

  const sku = useMemo(() => {
    const pc = printColor === "Standard Color" ? "SC" : "PC";
    const pk = pocket === "With Pocket" ? "WP" : "WOP";
    return `White-Printed-${size}-${pc}-${pk}-${qtyPack}`.replaceAll(".", "_");
  }, [pocket, printColor, qtyPack, size]);

  const images = useMemo(() => [whiteBag, whiteBag, whiteBag, whiteBag, whiteBag], []);

  function openZoom() {
    dialogRef.current?.showModal?.();
  }

  function closeZoom() {
    dialogRef.current?.close?.();
  }

  const product = useMemo(
    () => ({
      id: "custom-white-courier-51",
      title: "Custom Printed White Courier Bags – 51 micron",
      image: whiteBag,
      price: computedPrice,
      original: computedPrice,
      href: "/product/custom-printed-white-courier-bags-51-micron",
      kind: "custom",
      rating: 5,
    }),
    [computedPrice],
  );

  function addToCart({ openDrawer } = { openDrawer: true }) {
    cart.addItem(
      product,
      {
        qty,
        options: {
          size,
          print: printColor,
          pocket,
          pack: qtyPack,
        },
        openDrawer,
      },
    );
  }

  return (
    <section className="productPage" aria-label="Custom printed white courier bags detail">
      <div className="container">
        <div className="breadcrumb" aria-label="Breadcrumb">
          <Link className="breadcrumb__item" to="/">
            Home
          </Link>
          <span className="breadcrumb__sep">/</span>
          <Link className="breadcrumb__item" to="/custom-printed-courier-bags">
            Custom Printed Courier Bags
          </Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__item">Custom Printed White Courier Bag</span>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__item breadcrumb__item--active">Custom Printed White Courier Bags – 51 Micron</span>
        </div>

        <div className="pdGrid">
          <div className="pdLeft">
            <div className="pdMedia" aria-label="Product image preview">
              <button className="zoomBtn" type="button" aria-label="Zoom image" onClick={openZoom}>
                <IconSearchPlus />
              </button>
              <img className="pdImg" src={images[activeImg]} alt="Custom printed white courier bag" />
            </div>

            <div className="pdThumbs" aria-label="Product thumbnails">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={idx === activeImg ? "pdThumb pdThumb--active" : "pdThumb"}
                  aria-label={`Preview image ${idx + 1}`}
                  onClick={() => setActiveImg(idx)}
                >
                  <img className="pdThumb__img" src={img} alt="" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className="pdRight">
            <h1 className="pdTitle">Custom Printed White Courier Bags – 51 micron</h1>

            <div className="pdRating">
              <div className="pdStars" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} />
                ))}
              </div>
              <a className="pdReviewsLink" href="#" aria-label="14 customer reviews" onClick={(e) => e.preventDefault()}>
                (14 Customer Reviews)
              </a>
            </div>

            <div className="pdRange">
              {formatINR(range.min)} – {formatINR(range.max)}
            </div>
            <div className="pdNote">
              <strong>Shipping And GST Calculated At Checkout.</strong>
            </div>

            <div className="pdContact" aria-label="WhatsApp for printing sample">
              <span>For Printing Sample Whatsapp Us:</span>
              <a className="pdContact__wa" href="https://wa.me/918200421794" target="_blank" rel="noreferrer">
                <IconWhatsapp />
                <span>+91 82004 21794</span>
              </a>
            </div>

            <div className="pdOptions" aria-label="Product options">
              <OptionGroup label={`Bag Size : ${size}`}>
                {sizes.map((s) => (
                  <button
                    key={s}
                    className={s === size ? "pill pill--active" : "pill"}
                    type="button"
                    onClick={() => setSize(s)}
                    aria-pressed={s === size}
                  >
                    {s}
                  </button>
                ))}
              </OptionGroup>

              <div className="optionRow">
                <div className="optionLabel">
                  Print Color : <span className="optionValue">{printColor}</span>
                </div>
                <div className="pillRow">
                  {printColors.map((p) => (
                    <button
                      key={p}
                      className={p === printColor ? "pill pill--active" : "pill"}
                      type="button"
                      onClick={() => setPrintColor(p)}
                      aria-pressed={p === printColor}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="optionRow">
                <div className="optionLabel">
                  Pocket Option : <span className="optionValue">{pocket}</span>
                </div>
                <div className="pillRow">
                  {pockets.map((p) => (
                    <button
                      key={p}
                      className={p === pocket ? "pill pill--active" : "pill"}
                      type="button"
                      onClick={() => setPocket(p)}
                      aria-pressed={p === pocket}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <OptionGroup label={`Bag Quantity : ${qtyPack}`}>
                {qtyPacks.map((q) => (
                  <button
                    key={q}
                    className={q === qtyPack ? "pill pill--active" : "pill"}
                    type="button"
                    onClick={() => setQtyPack(q)}
                    aria-pressed={q === qtyPack}
                  >
                    {q}
                  </button>
                ))}
              </OptionGroup>

              <button className="clearLink" type="button" onClick={() => setPrintColor("Standard Color")}>
                Clear
              </button>
            </div>

            <div className="pdPrice" aria-label="Selected price">
              <span className="pdPrice__now">{formatINR(computedPrice)}</span>
            </div>

            <div className="uploadBox" aria-label="Upload an image">
              <div className="uploadLabel">Upload an image :</div>
              <label className="uploadCtl">
                <input className="uploadInput" type="file" />
                <span className="uploadBtn">Choose file</span>
                <span className="uploadHint">No file chosen</span>
              </label>
            </div>

            <div className="pdBuyRow">
              <div className="qtyCtl" aria-label="Quantity selector">
                <button className="qtyBtn" type="button" onClick={() => setQty((v) => Math.max(1, v - 1))}>
                  −
                </button>
                <div className="qtyVal">{qty}</div>
                <button className="qtyBtn" type="button" onClick={() => setQty((v) => v + 1)}>
                  +
                </button>
              </div>

              <button className="primaryBuyBtn" type="button" onClick={() => addToCart({ openDrawer: true })}>
                Add To Cart
              </button>
            </div>

            <div className="pdActions">
              <a className="waBuyBtn" href="https://wa.me/918200421794" target="_blank" rel="noreferrer">
                Order on WhatsApp
              </a>
              <button className="primaryBuyBtn primaryBuyBtn--alt" type="button" onClick={() => addToCart({ openDrawer: true })}>
                Buy Now
              </button>
            </div>

            <div className="pdMeta" aria-label="Product information">
              <div className="pdMetaRow">
                <span className="pdMetaKey">SKU</span>
                <span className="pdMetaVal">{sku}</span>
              </div>
              <div className="pdMetaRow">
                <span className="pdMetaKey">Categories</span>
                <span className="pdMetaVal">
                  <Link className="inlineLink" to="/custom-printed-courier-bags">
                    Custom Printed Courier Bags
                  </Link>
                  {", "}
                  <span className="inlineLink">Custom Printed White Courier Bag</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <section className="pdTabs" aria-label="Product information tabs">
          <div className="pdTabList" role="tablist" aria-label="Tabs">
            {["Description", "Additional Information", "Reviews (14)"].map((t) => (
              <button
                key={t}
                className={t === tab ? "pdTab pdTab--active" : "pdTab"}
                type="button"
                role="tab"
                aria-selected={t === tab}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="pdTabPanel" role="tabpanel">
            {tab === "Description" ? (
              <div className="descSection descSection--compact">
                <h2 className="descTitle">Description</h2>
                <p className="descIntro">
                  These Luxe Printed Courier Shipping Bags Are Perfect To Ship. They Have High Tensile Strength. They Are Tamper
                  Proof So After Sealing Bags Cannot Be Opened.
                </p>
                <ul className="descList">
                  <li>All Bags Are Black Colour (printing as per your design)</li>
                  <li>
                    <strong>Custom Printing Prices :</strong> This Prices For Single Side Printing. For Multi-Side Printing Price Is
                    Extra.
                  </li>
                  <li>
                    <strong>Single Color Printing :</strong> Color Options : Silver, Golden, Black, White, Orange, Green Or As Per
                    Your Choice..
                  </li>
                  <li>
                    <strong>Tips For Printing :</strong> Keep The Font Size Slightly Bigger, Avoid Micro(Small) Printing.
                  </li>
                  <li>
                    <strong>Please Note :</strong> Printed Bags Are NOT Returnable.
                  </li>
                  <li>
                    <strong>Shipping :</strong> 15 Days Depending On Waiting Of Printing Order And Your Location Service.
                  </li>
                </ul>
              </div>
            ) : null}

            {tab === "Additional Information" ? (
              <div className="descSection descSection--compact">
                <h2 className="descTitle">Additional Information</h2>
                <ul className="descList">
                  <li>Material: HDPE courier cover</li>
                  <li>Finish: Glossy</li>
                  <li>Printing: Custom logo & branding</li>
                </ul>
              </div>
            ) : null}

            {tab === "Reviews (14)" ? (
              <div className="descSection descSection--compact">
                <h2 className="descTitle">Reviews</h2>
                <ul className="descList">
                  <li>“Very happy with my purchase! The parcel was delivered on time, and the quality is excellent.”</li>
                  <li>“Quality was quite good.”</li>
                  <li>“Good quality very nice.”</li>
                </ul>
              </div>
            ) : null}
          </div>
        </section>

        <section className="relatedSection" aria-label="Related products">
          <div className="sectionTitle">
            <h2 className="sectionTitle__text">Related products</h2>
            <div className="sectionTitle__underline" aria-hidden="true" />
          </div>

          <div className="relatedGrid">
            <RelatedCard title="Custom Printed Pink Courier Bags – 60 micron" image={pinkBag} href="/product/custom-printed-pink-courier-bags-60-micron" />
            <RelatedCard title="Custom Printed Purple Courier Bags – 60 micron" image={purpleBag} href="/product/custom-printed-purple-courier-bags-60-micron" />
            <RelatedCard title="Custom Printed Black Courier Covers – 60 micron" image={blackBag} href="#" />
          </div>
        </section>

        <dialog ref={dialogRef} className="zoomDialog" aria-label="Image zoom">
          <div className="zoomDialog__inner">
            <button className="zoomClose" type="button" onClick={closeZoom} aria-label="Close zoom">
              <IconX />
            </button>
            <img className="zoomImg" src={images[activeImg]} alt="Custom printed white courier bag zoomed" />
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

function RelatedCard({ title, image, href }) {
  const wishlist = useWishlist();
  const id = `wish_${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
  const content = (
    <article className="productCard">
      <div className="productCard__media">
        <button
          className="wishBtn"
          type="button"
          aria-label="Add to wishlist"
          onClick={() => wishlist.toggle({ id, title, image, price: null, href })}
        >
          <IconHeart />
        </button>
        <img className="productCard__img" src={image} alt={title} loading="lazy" />
      </div>
      <div className="productCard__body">
        <h3 className="productCard__title" title={title}>
          {title}
        </h3>
        <div className="rating" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <IconStar key={i} />
          ))}
        </div>
        <div className="priceRow" aria-label="Price">
          <span className="priceRow__original">₹790.00</span>
          <span className="priceRow__price">₹11,315.00</span>
        </div>
        {href && href !== "#" ? (
          <Link className="cartBtn" to={href} aria-label="Select options">
            <IconCart className="cartBtn__icon" />
            <span>Select options</span>
          </Link>
        ) : (
          <button className="cartBtn" type="button" aria-label="Select options">
            <IconCart className="cartBtn__icon" />
            <span>Select options</span>
          </button>
        )}
      </div>
    </article>
  );

  return content;
}
