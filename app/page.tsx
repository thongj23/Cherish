import { getAdminDb } from "@/lib/firebaseAdmin"
import type { Product } from "@/types/product/product"
import BioClient from "@/components/bio/BioClient"

function toMillis(v: any) {
  try {
    if (v && typeof v.toMillis === "function") return v.toMillis()
    if (v instanceof Date) return v.getTime()
  } catch {}
  return v ?? null
}

async function fetchProductsServer(): Promise<Product[]> {
  const db = getAdminDb()
  const snap = await db.collection("products").get()
  const data = snap.docs.map((d) => {
    const raw = d.data() as any
    return {
      id: d.id,
      ...raw,
      createdAt: toMillis(raw?.createdAt),
      updatedAt: toMillis(raw?.updatedAt),
    }
  }) as Product[]
  const visible = data.filter((p) => {
    const status = String((p as any).status || "").trim().toLowerCase()
    return status === "active" || status === "inactive"
  })
  return visible
}

export default async function BioPage() {
  const products = await fetchProductsServer()
  return <BioClient initialProducts={products} />
}
