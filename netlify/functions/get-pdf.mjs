import { getStore } from "@netlify/blobs";

function text(message, status) {
  return new Response(message, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" }
  });
}

export default async function handler(request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return text("Method not allowed.", 405);
  }

  try {
    const key = new URL(request.url).searchParams.get("key");
    if (!key) return text("PDF key is required.", 400);

    const store = getStore("kb-pdfs");
    const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
    if (!result) return text("PDF not found.", 404);

    const filename = String(
      result.metadata?.originalFilename || result.metadata?.filename || "document.pdf"
    ).replace(/["\r\n]/g, "");

    const headers = {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${filename}"`,
      "cache-control": "private, max-age=300",
      "x-content-type-options": "nosniff"
    };

    if (request.method === "HEAD") return new Response(null, { status: 200, headers });
    return new Response(result.data, { status: 200, headers });
  } catch (error) {
    console.error("PDF retrieval failed:", error);
    return text("The PDF could not be loaded.", 500);
  }
}
