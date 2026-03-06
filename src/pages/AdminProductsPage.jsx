import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../products/ProductsContext.jsx";

export default function AdminProductsPage() {
  const productsApi = useProducts();
  const apiProducts = productsApi.apiProducts;

  const [editingId, setEditingId] = useState("");
  const [edit, setEdit] = useState({
    title: "",
    image: "",
    price: "",
    original: "",
    kind: "standard",
    href: "",
    pricingJson: "",
    featured: true,
  });

  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [original, setOriginal] = useState("");
  const [kind, setKind] = useState("standard");
  const [href, setHref] = useState("");
  const [pricingJson, setPricingJson] = useState("");
  const [featured, setFeatured] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (!image.trim()) return false;
    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) return false;
    if (kind === "custom" && !href.trim()) return false;
    return true;
  }, [title, image, price, kind, href]);

  async function onCreate() {
    setError("");
    if (!canSubmit) {
      setError("Please fill required fields.");
      return;
    }
    let pricing;
    if (pricingJson.trim()) {
      try {
        pricing = JSON.parse(pricingJson);
      } catch {
        setError("Pricing JSON is invalid. Please fix it or clear the field.");
        return;
      }
    }
    setBusy(true);
    const payload = {
      title: title.trim(),
      image: image.trim(),
      price: Number(price),
      original: original.trim() ? Number(original) : undefined,
      kind,
      href: href.trim() ? href.trim() : undefined,
      pricing,
      featured,
    };
    const res = await productsApi.createProduct(payload);
    setBusy(false);
    if (!res.ok) {
      setError(res.error || "Failed to create product.");
      return;
    }
    setTitle("");
    setImage("");
    setPrice("");
    setOriginal("");
    setKind("standard");
    setHref("");
    setPricingJson("");
    setFeatured(true);
  }

  async function onSaveEdit() {
    setError("");
    if (!editingId) return;
    let pricing;
    if (edit.pricingJson?.trim()) {
      try {
        pricing = JSON.parse(edit.pricingJson);
      } catch {
        setError("Pricing JSON is invalid. Please fix it or clear the field.");
        return;
      }
    }
    const payload = {
      title: edit.title.trim(),
      image: edit.image.trim(),
      price: Number(edit.price),
      original: edit.original.trim() ? Number(edit.original) : undefined,
      kind: edit.kind,
      href: edit.href.trim() ? edit.href.trim() : undefined,
      pricing,
      featured: Boolean(edit.featured),
    };
    setBusy(true);
    const res = await productsApi.updateProduct(editingId, payload);
    setBusy(false);
    if (!res.ok) {
      setError(res.error || "Update failed.");
      return;
    }
    setEditingId("");
  }

  return (
    <section className="adminPage" aria-label="Admin products">
      <div className="container">
        <div className="adminTop">
          <div>
            <div className="adminTop__title">Products</div>
            <div className="adminUsersCount">{apiProducts.length} products added by admin</div>
            {productsApi.status !== "ready" ? (
              <div className="adminUsersCount">
                API status: {productsApi.status}
                {productsApi.lastError ? ` • ${productsApi.lastError}` : ""} (start `npm run api-server`)
              </div>
            ) : null}
          </div>
          <div className="adminTop__actions">
            <button className="cartActionBtn" type="button" onClick={productsApi.reload}>
              Refresh
            </button>
            <Link className="cartActionBtn" to="/admin">
              Back
            </Link>
          </div>
        </div>

        <div className="adminCard">
          <div className="adminCard__title">Add Product</div>
          <div className="adminProdForm" aria-label="Add product form">
            <label className="authLabel">
              <span>Title *</span>
              <input className="authInput" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product title" />
            </label>

            <label className="authLabel">
              <span>Image URL *</span>
              <input className="authInput" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
            </label>

            <div className="adminProdRow">
              <label className="authLabel">
                <span>Price (₹) *</span>
                <input className="authInput" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="0" />
              </label>
              <label className="authLabel">
                <span>Original (₹)</span>
                <input className="authInput" value={original} onChange={(e) => setOriginal(e.target.value)} inputMode="decimal" placeholder="0" />
              </label>
            </div>

            <div className="adminProdRow">
              <label className="authLabel">
                <span>Kind</span>
                <select className="authInput" value={kind} onChange={(e) => setKind(e.target.value)}>
                  <option value="standard">Standard</option>
                  <option value="custom">Custom (Select options)</option>
                </select>
              </label>
              <label className="authLabel">
                <span>Href (for custom)</span>
                <input
                  className="authInput"
                  value={href}
                  onChange={(e) => setHref(e.target.value)}
                  placeholder="/product/..."
                  disabled={kind !== "custom"}
                />
              </label>
            </div>

           

            <label className="adminCheck">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              <span>Show on website (Best Sellers)</span>
            </label>

            {error ? <div className="authError">{error}</div> : null}

            <button className="authBtn" type="button" disabled={!canSubmit || busy} onClick={onCreate}>
              {busy ? "Adding..." : "Add Product"}
            </button>
          </div>
        </div>

        <div className="adminCard" style={{ marginTop: 14 }}>
          <div className="adminCard__title">Admin Products</div>
          {apiProducts.length === 0 ? (
            <div className="adminEmpty">No admin products yet.</div>
          ) : (
            <div className="adminProdList" aria-label="Admin product list">
              {apiProducts.map((p) => (
                <div key={p.id} className="adminProdItemWrap">
                  <div className="adminProdItem">
                    <img className="adminProdItem__img" src={p.image} alt="" aria-hidden="true" />
                    <div className="adminProdItem__meta">
                      <div className="adminProdItem__title">{p.title}</div>
                      <div className="adminProdItem__sub">
                        {p.kind} • ₹{Number(p.price).toFixed(2)} {p.featured ? "• featured" : ""}
                      </div>
                    </div>
                    <div className="adminProdItem__actions">
                      <button
                        className="adminMiniBtn adminMiniBtn--edit"
                        type="button"
                        onClick={() => {
                          setError("");
                          setEditingId(p.id);
                          setEdit({
                            title: p.title || "",
                            image: p.image || "",
                            price: String(p.price ?? ""),
                            original: String(p.original ?? ""),
                            kind: p.kind || "standard",
                            href: p.href || "",
                            pricingJson: p.pricing ? JSON.stringify(p.pricing, null, 2) : "",
                            featured: Boolean(p.featured),
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="adminMiniBtn adminMiniBtn--delete"
                        type="button"
                        onClick={async () => {
                          const ok = window.confirm("Delete this product?");
                          if (!ok) return;
                          const res = await productsApi.deleteProduct(p.id);
                          if (!res.ok) setError(res.error || "Delete failed.");
                          if (editingId === p.id) setEditingId("");
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {editingId === p.id ? (
                    <div className="adminProdEdit" aria-label="Edit product">
                      <div className="adminProdRow">
                        <label className="authLabel">
                          <span>Title *</span>
                          <input
                            className="authInput"
                            value={edit.title}
                            onChange={(e) => setEdit((s) => ({ ...s, title: e.target.value }))}
                          />
                        </label>
                        <label className="authLabel">
                          <span>Image URL *</span>
                          <input
                            className="authInput"
                            value={edit.image}
                            onChange={(e) => setEdit((s) => ({ ...s, image: e.target.value }))}
                          />
                        </label>
                      </div>

                      <div className="adminProdRow">
                        <label className="authLabel">
                          <span>Price (₹) *</span>
                          <input
                            className="authInput"
                            value={edit.price}
                            onChange={(e) => setEdit((s) => ({ ...s, price: e.target.value }))}
                          />
                        </label>
                        <label className="authLabel">
                          <span>Original (₹)</span>
                          <input
                            className="authInput"
                            value={edit.original}
                            onChange={(e) => setEdit((s) => ({ ...s, original: e.target.value }))}
                          />
                        </label>
                      </div>

                      <div className="adminProdRow">
                        <label className="authLabel">
                          <span>Kind</span>
                          <select
                            className="authInput"
                            value={edit.kind}
                            onChange={(e) => setEdit((s) => ({ ...s, kind: e.target.value }))}
                          >
                            <option value="standard">Standard</option>
                            <option value="custom">Custom</option>
                          </select>
                        </label>
                        <label className="authLabel">
                          <span>Href (for custom)</span>
                          <input
                            className="authInput"
                            value={edit.href}
                            onChange={(e) => setEdit((s) => ({ ...s, href: e.target.value }))}
                            disabled={edit.kind !== "custom"}
                          />
                        </label>
                      </div>

                      

                      <label className="adminCheck">
                        <input
                          type="checkbox"
                          checked={edit.featured}
                          onChange={(e) => setEdit((s) => ({ ...s, featured: e.target.checked }))}
                        />
                        <span>Show on website (Best Sellers)</span>
                      </label>

                      <div className="adminProdEdit__actions">
                        <button className="adminMiniBtn adminMiniBtn--confirm" type="button" onClick={onSaveEdit} disabled={busy}>
                          Save
                        </button>
                        <button
                          className="adminMiniBtn"
                          type="button"
                          onClick={() => {
                            setEditingId("");
                            setError("");
                          }}
                          disabled={busy}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
