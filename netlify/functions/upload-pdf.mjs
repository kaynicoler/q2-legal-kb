import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function cleanFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return json({ error: "A PDF file is required." }, 400);
    }

    if (file.type !== "application/pdf") {
      return json({ error: "Only PDF files are allowed." }, 400);
    }

    if (file.size === 0) {
      return json({ error: "The uploaded file is empty." }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return json(
        {
          error:
            "This PDF is too large for the current direct upload endpoint. Keep PDFs under 4 MB."
        },
        413
      );
    }

    const id = crypto.randomUUID();
    const safeName = cleanFilename(file.name || "document.pdf");
    const key = `${id}/${safeName}`;

    const store = getStore("kb-pdfs");

    await store.set(key, file, {
      metadata: {
        id,
        filename: safeName,
        originalFilename: file.name,
        contentType: "application/pdf",
        size: file.size,
        uploadedAt: new Date().toISOString()
      },
      onlyIfNew: true
    });

    return json(
      {
        id,
        key,
        filename: safeName,
        size: file.size,
        url: `/api/pdfs?key=${encodeURIComponent(key)}`
      },
      201
    );
  } catch (error) {
    console.error("PDF upload failed:", error);

    return json(
      {
        error: "The PDF could not be uploaded."
      },
      500
    );
  }
}
