import { useMemo, useRef, useState } from "react";
import previewImg from "../assets/product-frosted-printed.svg";
import { IconSearchPlus, IconStar, IconX } from "../components/icons/Icons.jsx";
import { useCart } from "../cart/CartContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocation, useNavigate } from "react-router-dom";

const sizes = ["4x4", "6x8", "8x10", "10x12", "12x16", "12x14", "14x18"];
const packQty = ["100", "200", "300", "500", "1000"];
const printColors = ["Premium Color", "Standard Color"];
const colors = ["Black", "Blue", "Orange", "Pink", "Purple", "Red", "White"];

export default function ProductDetailPage() {
  const cart = useCart();
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [size, setSize] = useState("4x4");
  const [qtyPack, setQtyPack] = useState("100");
  const [printColor, setPrintColor] = useState("Standard Color");
  const [bagColor, setBagColor] = useState("White");
  const [qty, setQty] = useState(1);
  const dialogRef = useRef(null);

  const sku = useMemo(() => `Zipper-Printed-${size}-${printColor === "Standard Color" ? "SC" : "PC"}-${qtyPack}`, [
    size,
    printColor,
    qtyPack,
  ]);

  function openZoom() {
    dialogRef.current?.showModal?.();
  }

  function closeZoom() {
    dialogRef.current?.close?.();
  }

  return (
    <section className="productPage" aria-label="Product detail">
      <div className="container">
        <div className="breadcrumb" aria-label="Breadcrumb">
          <span className="breadcrumb__item">Home</span>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__item">Frosted Zipper Bags</span>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__item">Frosted Custom Printed Zipper Bags</span>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__item breadcrumb__item--active">
            Custom Printed Frosted Slider Zipper Lock Bags
          </span>
        </div>

        <div className="pdGrid">
          <div className="pdLeft">
            <div className="pdMedia" aria-label="Product image preview">
              <button className="zoomBtn" type="button" aria-label="Zoom image" onClick={openZoom}>
                <IconSearchPlus />
              </button>
              <img className="pdImg" src={previewImg} alt="Custom printed frosted slider zipper lock bags" />
            </div>
          </div>

          <div className="pdRight">
            <h1 className="pdTitle">Custom Printed Frosted Slider Zipper Lock Bags</h1>

            <div className="pdRating">
              <div className="pdStars" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} />
                ))}
              </div>
              <a className="pdReviewsLink" href="#" aria-label="3 customer reviews">
                (3 Customer Reviews)
              </a>
            </div>

            <div className="pdRange">₹1,100.00 – ₹16,350.00</div>
            <div className="pdNote">Shipping And GST Calculated At Checkout.</div>

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

              <OptionGroup label={`Bag Quantity : ${qtyPack}`}>
                {packQty.map((q) => (
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
                <button className="clearLink" type="button" onClick={() => setPrintColor("Standard Color")}>
                  Clear
                </button>
              </div>

              <div className="optionRow">
                <div className="optionLabel">Choose Color</div>
                <div className="colorRow" aria-label="Choose color">
                  {colors.map((c) => (
                    <button
                      key={c}
                      className={c === bagColor ? "colorPill colorPill--active" : "colorPill"}
                      type="button"
                      onClick={() => setBagColor(c)}
                      aria-pressed={c === bagColor}
                    >
                      <span className={`colorDot colorDot--${c.toLowerCase()}`} aria-hidden="true" />
                      <span>{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pdPrice" aria-label="Discounted price">
              <span className="pdPrice__orig">₹1,368.00</span>
              <span className="pdPrice__now">₹1,140.00</span>
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
                <button
                  className="qtyBtn"
                  type="button"
                  onClick={() => setQty((v) => Math.max(1, v - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <div className="qtyVal" aria-label={`Quantity ${qty}`}>
                  {qty}
                </div>
                <button
                  className="qtyBtn"
                  type="button"
                  onClick={() => setQty((v) => v + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                className="primaryBuyBtn"
                type="button"
                onClick={() =>
                  cart.addItem(
                    {
                      id: "custom-frosted-slider",
                      title: "Custom Printed Frosted Slider Zipper Lock Bags",
                      image: previewImg,
                      price: 1140,
                      href: "/product/custom-printed-frosted-slider-zipper-lock-bags",
                      kind: "custom",
                    },
                    {
                      qty,
                      options: {
                        size,
                        pack: qtyPack,
                        print: printColor,
                        color: bagColor,
                      },
                    },
                  )
                }
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
                  cart.addItem(
                    {
                      id: "custom-frosted-slider",
                      title: "Custom Printed Frosted Slider Zipper Lock Bags",
                      image: previewImg,
                      price: 1140,
                      href: "/product/custom-printed-frosted-slider-zipper-lock-bags",
                      kind: "custom",
                    },
                    {
                      qty,
                      options: {
                        size,
                        pack: qtyPack,
                        print: printColor,
                        color: bagColor,
                      },
                    },
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
                <a className="inlineLink" href="#">
                  Frosted Custom Printed Zipper Bags
                </a>
              </div>
            </div>
          </div>
        </div>

        <section className="descSection" aria-label="Product description">
          <h2 className="descTitle">Description</h2>
          <p className="descIntro">They Have High Tensile Strength And Have A Zipper.</p>

          <ul className="descList" aria-label="Product specifications">
            <li>
              <strong>Material</strong> – HMLD+LLDPE, BPA Free, Non Toxic Plastic.
            </li>
            <li>
              <strong>Thickness</strong> – 90–110 Micron
            </li>
            <li>
              <strong>Closure Type</strong> – Slider Zip Lock
            </li>
            <li>
              <strong>Reusability</strong> – Resealable And Reusable
            </li>
            <li>
              <strong>Recyclable</strong> – Eco-Friendly Bio-Degradable And 100% Recyclable
            </li>
            <li>
              <strong>Origin</strong> – Made In India
            </li>
            <li>
              <strong>GST Invoice</strong> – Available
            </li>
            <li>
              <strong>Minimum Order Quantity</strong> – 100 Bags. (Buy 100, 200, 500, 1000 Etc.)
            </li>
          </ul>

          <h3 className="descSub">Customisation :</h3>
          <ul className="descList">
            <li>
              <strong>Custom Printing Prices :</strong> Prices For Single Side Available.
            </li>
            <li>
              <strong>Tips For Printing :</strong> Keep The Font Sizes Bigger. Very Small Fonts May Not Come Clearly.
            </li>
            <li>
              Slight Color Variations Can Occur Between Print Runs Due To Changes In Ink, Substrate, And Printing
              Conditions.
            </li>
            <li>
              Achieving An Exact Color Match (Pantone Colors) Can Be Challenging But We Try To Match The Nearest Color
              To A Given Color.
            </li>
            <li>
              Due To The Technology And Materials Used In Manufacturing Processes, The Actual Size Of A Given Product
              Might Vary Up To +/-1%.
            </li>
          </ul>

          <h3 className="descSub">Shipping:</h3>
          <ul className="descList">
            <li>
              <strong>Please Note :</strong> Printed Bags Are NOT Returnable
            </li>
            <li>Processing Of Custom Products May Take 4–9 Business Days.</li>
            <li>
              <strong>Shipping Time :</strong> 2–7 Days Depending On The Location.
            </li>
            <li>Tracking Details Will Be Emailed Once In Transit.</li>
            <li>
              Please Make A Video While Opening The Packaging As Supporting Proof In Case You Wish To Claim For Any
              Return/Replacement.
            </li>
          </ul>
        </section>

        <dialog ref={dialogRef} className="zoomDialog" aria-label="Image zoom">
          <div className="zoomDialog__inner">
            <button className="zoomClose" type="button" onClick={closeZoom} aria-label="Close zoom">
              <IconX />
            </button>
            <img className="zoomImg" src={previewImg} alt="Custom printed frosted slider zipper lock bags zoomed" />
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
