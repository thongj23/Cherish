"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

// Small, mobile-first QR scan + manual input page
export default function ScanPage() {
  const router = useRouter()
  const [raw, setRaw] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [scanId, setScanId] = useState<string | null>(null)
  const scannerRef = useRef<HTMLDivElement | null>(null)
  const scannerInstance = useRef<any>(null)

  const functionUrl = process.env.NEXT_PUBLIC_FUNCTION_SAVE_SCAN_URL || ""

  // Try parse QR content as JSON to detect an order/invoice object
  const parsed = useMemo(() => {
    try {
      const obj = JSON.parse(raw)
      if (obj && typeof obj === "object") return obj
      return null
    } catch {
      return null
    }
  }, [raw])

  const isOrderObject = useMemo(() => {
    if (!parsed) return false
    // Accept either { customer, items } or flat { name, phone, items }
    const hasCustomerItems = parsed.customer && Array.isArray(parsed.items)
    const hasFlatItems = (parsed.name || parsed.phone) && Array.isArray(parsed.items)
    return !!(hasCustomerItems || hasFlatItems)
  }, [parsed])

  useEffect(() => {
    // Load html5-qrcode only on client
    let cancelled = false
    ;(async () => {
      try {
        const mod: any = await import("html5-qrcode")
        if (cancelled) return
        const Html5QrcodeScanner = mod.Html5QrcodeScanner

        // Create scanner UI in target div
        if (scannerRef.current && !scannerInstance.current) {
          scannerInstance.current = new Html5QrcodeScanner(
            scannerRef.current.id,
            {
              fps: 10,
              qrbox: { width: 220, height: 220 },
              rememberLastUsedCamera: true,
              aspectRatio: 1.0,
            },
            /* verbose= */ false
          )

          const onSuccess = (decodedText: string) => {
            setRaw(decodedText)
            setMessage("Đã đọc mã – kiểm tra và bấm Gửi")
          }
          const onError = () => {
            // ignore scan errors to keep UI calm
          }
          scannerInstance.current.render(onSuccess, onError)
        }
      } catch (err) {
        console.error("QR scanner load error", err)
      }
    })()
    return () => {
      cancelled = true
      try {
        scannerInstance.current?.clear?.()
      } catch (_) {}
    }
  }, [])

  const handleSubmit = async () => {
    if (!raw.trim()) {
      setMessage("Vui lòng quét mã hoặc nhập nội dung")
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      const endpoint = functionUrl || '/api/save-scan'
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw, source: "web" }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Gửi thất bại")
      }
      if (data?.id) setScanId(String(data.id))
      setMessage("Đã lưu bản quét thành công")
    } catch (err: any) {
      setMessage(err?.message || "Có lỗi xảy ra")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateOrderFromQR = async () => {
    if (!isOrderObject || !parsed) return
    setSubmitting(true)
    setMessage(null)
    try {
      // Nếu chưa có scanId thì lưu bản quét trước để liên kết
      let sid = scanId
      if (!sid) {
        const endpoint = functionUrl || '/api/save-scan'
        const resScan = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ raw, source: 'web' }) })
        const dataScan = await resScan.json().catch(() => ({}))
        if (resScan.ok && dataScan?.id) sid = String(dataScan.id)
        setScanId(sid || null)
      }
      // Normalize payload for /api/orders
      const customer = parsed.customer
        ? parsed.customer
        : { name: parsed.name || "", phone: parsed.phone || "", email: parsed.email || null, address: parsed.address || null }
      const items = Array.isArray(parsed.items) ? parsed.items : []
      // If pricing not provided, compute simple subtotal
      const subtotal = items.reduce((s: number, it: any) => s + (Number(it?.price) || 0) * (Number(it?.quantity) || 0), 0)
      const shippingFee = Number(parsed?.pricing?.shippingFee || 0)
      const discount = Number(parsed?.pricing?.discount || 0)
      const total = Number(parsed?.pricing?.total || subtotal + shippingFee - discount)

      const payload = {
        customer,
        items,
        pricing: { subtotal, shippingFee, discount, total, currency: "VND" },
        fulfillment: parsed.fulfillment || { method: "delivery", status: "pending" },
        payment: parsed.payment || { method: "cod", status: "unpaid" },
        meta: { ...(parsed.meta || {}), source: "qr", scanId: sid || null },
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Tạo đơn thất bại")
      setMessage("Đã tạo đơn hàng từ QR")
    } catch (err: any) {
      setMessage(err?.message || "Có lỗi xảy ra")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
        </Button>
        <Link href="/admin" className="text-sm text-gray-600 hover:underline">Về trang Admin</Link>
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-4 text-center">Quét QR hoặc nhập tay</h1>

      <Card className="p-3 mb-4">
        <div id="qr-reader" ref={scannerRef} className="w-full" />
      </Card>

      <div className="space-y-2">
        <label className="text-sm text-gray-700">Nội dung</label>
        <Input
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="Dán/nhập nội dung tại đây"
        />
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "Đang gửi..." : "Lưu bản quét"}
          </Button>
          {isOrderObject && (
            <Button onClick={handleCreateOrderFromQR} disabled={submitting} className="w-full" variant="outline">
              {submitting ? "Đang tạo..." : "Tạo đơn từ QR"}
            </Button>
          )}
        </div>
        {isOrderObject && parsed && (
          <div className="text-xs text-gray-600 bg-gray-50 border rounded-md p-2">
            <div><strong>Phát hiện đơn hàng:</strong> {parsed?.customer?.name || parsed?.name || "(khách)"} • {parsed?.customer?.phone || parsed?.phone || "(SĐT)"}</div>
            <div>Sản phẩm: {Array.isArray(parsed.items) ? parsed.items.length : 0} • Tổng (ước tính):
              {(() => {
                try {
                  const items = Array.isArray(parsed.items) ? parsed.items : []
                  const subtotal = items.reduce((s: number, it: any) => s + (Number(it?.price) || 0) * (Number(it?.quantity) || 0), 0)
                  const shippingFee = Number(parsed?.pricing?.shippingFee || 0)
                  const discount = Number(parsed?.pricing?.discount || 0)
                  const total = Number(parsed?.pricing?.total || subtotal + shippingFee - discount)
                  return ` ${total.toLocaleString('vi-VN')}đ`
                } catch {
                  return " -"
                }
              })()}
            </div>
          </div>
        )}
        {message && <p className="text-sm text-center text-gray-700">{message}</p>}
      </div>
    </div>
  )
}
