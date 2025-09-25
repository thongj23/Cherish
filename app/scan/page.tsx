"use client"

import { useEffect, useRef, useState } from "react"
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
  const [cameraError, setCameraError] = useState<string | null>(null)
  const scannerRef = useRef<HTMLDivElement | null>(null)
  const scannerInstance = useRef<any>(null)

  const functionUrl = process.env.NEXT_PUBLIC_FUNCTION_SAVE_SCAN_URL || ""

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
            setCameraError(null)
          }
          const onError = (err: unknown) => {
            setCameraError("Không thể nhận diện mã. Kiểm tra ánh sáng hoặc lau sạch camera.")
            console.debug("scan error", err)
          }
          scannerInstance.current.render(onSuccess, onError)
        }
      } catch (err) {
        console.error("QR scanner load error", err)
        setCameraError("Không thể khởi động máy quét. Kiểm tra quyền truy cập camera.")
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
    if (!functionUrl) {
      setMessage("Thiếu URL Cloud Function (NEXT_PUBLIC_FUNCTION_SAVE_SCAN_URL)")
      return
    }
    setSubmitting(true)
    setMessage(null)
    setCameraError(null)
    try {
      const res = await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw, source: "web" }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || "Gửi thất bại")
      }
      setMessage("Đã lưu thành công")
      setRaw("")
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

      <div className="mb-4 rounded-lg border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-700">
        <p className="font-medium">Mẹo quét nhanh:</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Giữ điện thoại cách mã từ 15 – 20cm và đảm bảo đủ ánh sáng.</li>
          <li>Nếu camera không khởi động, kiểm tra quyền truy cập trong trình duyệt.</li>
          <li>Có thể nhập thủ công ở ô phía dưới nếu cần.</li>
        </ul>
      </div>

      <Card className="p-3 mb-4">
        <div id="qr-reader" ref={scannerRef} className="w-full" />
      </Card>

      {cameraError && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700" role="alert">
          {cameraError}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm text-gray-700">Nội dung</label>
        <Input
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="Dán/nhập nội dung tại đây"
        />
        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting ? "Đang gửi..." : "Gửi"}
        </Button>
        {message && (
          <p className="text-sm text-center text-gray-700" aria-live="polite">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
