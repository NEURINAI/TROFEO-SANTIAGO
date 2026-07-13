import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

// Endpoint TEMPORAL de diagnóstico: verifica que la subida a Vercel Blob funciona.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "no auth" }, { status: 401 });

  const info = {
    hasStoreId: !!process.env.BLOB_STORE_ID,
    hasRwToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    hasOidc: !!process.env.VERCEL_OIDC_TOKEN,
  };

  try {
    const opts = { access: "public", contentType: "text/plain" };
    if (process.env.BLOB_READ_WRITE_TOKEN) opts.token = process.env.BLOB_READ_WRITE_TOKEN;
    const blob = await put(`diagnostico/test-${Date.now()}.txt`, "ok", opts);
    return NextResponse.json({ ok: true, url: blob.url, ...info });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || String(e), ...info }, { status: 500 });
  }
}
