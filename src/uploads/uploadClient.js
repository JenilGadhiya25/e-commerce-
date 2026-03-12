function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Failed to read file."));
    r.onload = () => resolve(String(r.result || ""));
    r.readAsDataURL(file);
  });
}

export async function uploadDesignImage({ file, customerId }) {
  if (!file) return { ok: false, error: "No file selected." };
  if (!customerId) return { ok: false, error: "Please login first." };
  const maxBytes = 1_000_000;
  if (file.size > maxBytes) return { ok: false, error: "File too large. Max 1MB." };

  const dataUrl = await readFileAsDataUrl(file);
  const res = await fetch("/api/uploads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      customerId,
      filename: file.name || "upload",
      contentType: file.type || "application/octet-stream",
      dataUrl,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok || !data?.upload?.id) {
    return { ok: false, error: data?.error || `HTTP ${res.status}` };
  }
  return { ok: true, upload: data.upload };
}

export function uploadUrl(uploadId) {
  return uploadId ? `/api/uploadGet?id=${encodeURIComponent(uploadId)}` : "";
}
