"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import AdminNav from "@/components/adminPage/AdminNav"
import type { Product } from "@/types/product/product"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

type Item = {
  name: string
  category: string
  subCategory: string
  size?: number | null
  quantity: number
  price?: number | null
  imageUrl?: string | null
}

function OrderPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const embedded = useMemo(() => {
    const viaQuery = searchParams?.get("embed") === "1" || searchParams?.has("embed")
    let viaIframe = false
    if (typeof window !== 'undefined') {
      try { viaIframe = window.self !== window.top } catch { viaIframe = true }
    }
    return Boolean(viaQuery || viaIframe)
  }, [searchParams])
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  })
  const [note, setNote] = useState("")
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery")
  const [payment, setPayment] = useState<"cod" | "transfer" | "momo">("cod")
  const [items, setItems] = useState<Item[]>([
    { name: "", category: "Dep", subCategory: "", size: null, quantity: 1, price: null },
  ])
  const [saving, setSaving] = useState(false)
  const [region, setRegion] = useState<"HCM" | "HN" | "TINH">("HCM")
  const [autoShip, setAutoShip] = useState(true)
  const [freeShipThreshold, setFreeShipThreshold] = useState<number>(300000)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [productSearch, setProductSearch] = useState("")
  const [shippingFee, setShippingFee] = useState<number>(0)

  // --

  // Only load products when the picker is opened the first time
  useEffect(() => {
    if (!pickerOpen || products.length > 0) return
    let cancelled = false
    ;(async () => {
      try {
        setLoadingProducts(true)
        const snap = await getDocs(collection(db, "products"))
        if (cancelled) return
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Product[]
        const visible = list.filter((p) => {
          const st = String(p.status || "").toLowerCase().trim()
          return st === "active" || st === "inactive"
        })
        setProducts(visible)
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingProducts(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [pickerOpen, products.length])

  const filteredProducts = useMemo(() => {
    if (!pickerOpen) return []
    const q = productSearch.toLowerCase().trim()
    if (!q) return products
    return products.filter((p) =>
      (p.name || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
    )
  }, [productSearch, products, pickerOpen])

  const subtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0)
  const total = subtotal + (Number(shippingFee) || 0)

  useEffect(() => {
    if (!autoShip) return
    const preset: Record<string, number> = { HCM: 15000, HN: 20000, TINH: 30000 }
    const base = preset[region]
    const fee = subtotal >= freeShipThreshold ? 0 : base
    setShippingFee(fee)
  }, [region, subtotal, freeShipThreshold, autoShip])

  const updateItem = (index: number, patch: Partial<Item>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { name: "", category: "Dep", subCategory: "", size: null, quantity: 1, price: null, imageUrl: null },
    ])
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index))

  const submit = async () => {
    // Basic validation
    if (!customer.name.trim()) return toast({ title: "Vui lòng nhập tên" })
    if (!/^(\+?84|0)\d{9,10}$/.test(customer.phone.replace(/\s+/g, ""))) return toast({ title: "SĐT không hợp lệ" })
    if (fulfillment === "delivery" && !customer.address.trim()) return toast({ title: "Vui lòng nhập địa chỉ" })
    const validItems = items.filter((it) => it.name.trim() && it.quantity > 0)
    if (validItems.length === 0) return toast({ title: "Thêm ít nhất 1 sản phẩm" })

    const confirmText = `Tạo đơn cho ${customer.name} - ${customer.phone}\nSản phẩm: ${validItems.length}\nTổng: ${total.toLocaleString('vi-VN')}đ\n\nXác nhận?`
    if (typeof window !== 'undefined' && !window.confirm(confirmText)) return

    setSaving(true)
    try {
      const payload = {
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          email: customer.email.trim() || null,
          address: fulfillment === "delivery" ? customer.address.trim() : null,
        },
        items: validItems.map((it) => ({
          name: it.name.trim(),
          category: it.category || "",
          subCategory: it.subCategory || "",
          imageUrl: it.imageUrl || null,
          size: it.size || null,
          quantity: Number(it.quantity) || 1,
          price: Number(it.price) || 0,
        })),
        pricing: { subtotal, shippingFee, discount: 0, total, currency: "VND" },
        fulfillment: { method: fulfillment, status: "pending" },
        payment: { method: payment, status: "unpaid" },
        meta: { source: "web", note: note.trim() || null },
      }
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'Tạo đơn thất bại')
      toast({ title: "Đã tạo đơn hàng" })
      // Reset form
      setCustomer({ name: "", phone: "", email: "", address: "" })
      setNote("")
      setFulfillment("delivery")
      setPayment("cod")
      setItems([{ name: "", category: "Dep", subCategory: "", size: null, quantity: 1, price: null, imageUrl: null }])
      setShippingFee(0)
    } catch (err) {
      console.error(err)
      toast({ title: (err as any)?.message || "Có lỗi xảy ra" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {!embedded && <AdminNav />}
      <div className="px-4 py-6 max-w-xl mx-auto">
        {!embedded && (
          <div className="flex items-center gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
            </Button>
          </div>
        )}
        <h1 className="text-xl font-semibold text-gray-900 mb-4 text-center">Đặt hàng</h1>

      {/* Customer */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <Input placeholder="Họ tên *" value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} />
          <Input placeholder="Số điện thoại *" value={customer.phone} onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))} />
          <Input placeholder="Email (tuỳ chọn)" value={customer.email} onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Nhận hàng</label>
              <Select value={fulfillment} onValueChange={(v: any) => setFulfillment(v)}>
                <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Hình thức" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Giao hàng</SelectItem>
                  <SelectItem value="pickup">Lấy tại cửa hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Thanh toán</label>
              <Select value={payment} onValueChange={(v: any) => setPayment(v)}>
                <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Phương thức" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cod">COD</SelectItem>
                  <SelectItem value="transfer">Chuyển khoản</SelectItem>
                  <SelectItem value="momo">Momo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {fulfillment === "delivery" && (
            <Input placeholder="Địa chỉ *" value={customer.address} onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))} />
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border rounded-xl p-4 space-y-3 mt-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-medium">Sản phẩm</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>Chọn từ danh sách</Button>
            <Button variant="outline" size="sm" onClick={addItem}>Thêm dòng trống</Button>
          </div>
        </div>
        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-3 border rounded-lg p-3">
              <Input placeholder="Tên sản phẩm *" value={it.name} onChange={(e) => updateItem(idx, { name: e.target.value })} />
              {/* Ảnh sản phẩm: xem trước + link */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white ring-1 ring-gray-200 flex-shrink-0">
                  <Image src={it.imageUrl || "/placeholder.svg"} alt={it.name || "Ảnh"} fill className="object-cover" />
                </div>
                <Input
                  placeholder="Link ảnh (tuỳ chọn)"
                  value={it.imageUrl ?? ""}
                  onChange={(e) => updateItem(idx, { imageUrl: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select value={it.category} onValueChange={(v: any) => updateItem(idx, { category: v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Danh mục" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dep">Dép</SelectItem>
                    <SelectItem value="Collab">Collab</SelectItem>
                    <SelectItem value="Charm">Charm</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Danh mục phụ (tuỳ chọn)" value={it.subCategory} onChange={(e) => updateItem(idx, { subCategory: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {it.category === "Dep" ? (
                  <Input type="number" placeholder="Size" value={it.size ?? ""} onChange={(e) => updateItem(idx, { size: e.target.value ? Number(e.target.value) : null })} />
                ) : (
                  <div className="hidden sm:block" />
                )}
                <Input type="number" placeholder="Số lượng *" value={it.quantity} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) || 1 })} />
                <Input type="number" placeholder="Đơn giá (VND)" value={it.price ?? ""} onChange={(e) => updateItem(idx, { price: e.target.value ? Number(e.target.value) : null })} />
              </div>
              {items.length > 1 && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>Xoá</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Note & Summary */}
      <div className="bg-white border rounded-xl p-4 space-y-3 mt-4">
        <Textarea placeholder="Ghi chú cho đơn hàng (tuỳ chọn)" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="text-sm text-gray-700 flex items-center justify-between">
          <span>Tạm tính</span>
          <strong>{subtotal.toLocaleString("vi-VN")}đ</strong>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="text-sm text-gray-700 flex items-center justify-between gap-3">
            <span>Khu vực giao</span>
            <Select value={region} onValueChange={(v: any) => setRegion(v)}>
              <SelectTrigger className="w-40 h-8"><SelectValue placeholder="Khu vực" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HCM">TP.HCM</SelectItem>
                <SelectItem value="HN">Hà Nội</SelectItem>
                <SelectItem value="TINH">Tỉnh</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-gray-700 flex items-center justify-between gap-3">
            <span>Miễn phí từ</span>
            <div className="flex items-center gap-2">
              <Input type="number" value={freeShipThreshold} onChange={(e) => setFreeShipThreshold(Number(e.target.value) || 0)} className="h-8 w-32 text-right" />
              <strong className="whitespace-nowrap">đ</strong>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-700 flex items-center justify-between gap-3">
          <span>Phí giao</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={shippingFee}
              onChange={(e) => setShippingFee(Number(e.target.value) || 0)}
              className="h-8 w-28 text-right"
              disabled={autoShip}
            />
            <label className="text-xs flex items-center gap-2">
              <input type="checkbox" checked={autoShip} onChange={(e) => setAutoShip(e.target.checked)} />
              Tự tính theo khu vực/ngưỡng
            </label>
          </div>
        </div>
        <div className="text-base flex items-center justify-between">
          <span className="font-medium">Tổng</span>
          <strong className="text-purple-700">{total.toLocaleString("vi-VN")}đ</strong>
        </div>
      </div>

      <Button className="w-full mt-4" onClick={submit} disabled={saving}>
        {saving ? "Đang tạo đơn..." : "Đặt hàng"}
      </Button>
      {/* Product Picker */}
      {pickerOpen && (
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chọn sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Tìm theo tên/mô tả" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
            <div className="max-h-[60vh] overflow-y-auto">
              {loadingProducts ? (
                <div className="text-center py-8 text-sm text-gray-600">Đang tải...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-600">Không tìm thấy sản phẩm</div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        // Add line from selected product
                        setItems((prev) => [
                          ...prev,
                          {
                            name: p.name,
                            category: (p.category as any) || "",
                            subCategory: (p.subCategory as any) || "",
                            size: null,
                            quantity: 1,
                            price: (p.price as any) ?? null,
                            imageUrl: (p as any).imageUrl || null,
                          },
                        ])
                        setPickerOpen(false)
                      }}
                      className="w-full text-left border rounded-lg p-2 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white ring-1 ring-gray-200 flex-shrink-0">
                        <Image src={p.imageUrl || "/placeholder.svg"} alt={p.name} fill className="object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{p.name}</div>
                        <div className="text-xs text-gray-600 truncate">{p.category}{p.subCategory ? ` • ${p.subCategory}` : ""}</div>
                      </div>
                      <div className="text-sm font-semibold text-purple-700 whitespace-nowrap">{(p.price ?? 0).toLocaleString("vi-VN")}đ</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      )}
      </div>
    </>
  )
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="px-4 py-6 max-w-xl mx-auto text-sm text-gray-600">Đang tải...</div>}>
      <OrderPageInner />
    </Suspense>
  )
}
