"use client"

import { useEffect, useState } from "react"
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
// Không cần import AdminLayout; layout của thư mục admin tự áp dụng
interface Order {
  id: string
  customerName: string
  productName: string
  quantity: number
  status: "pending" | "completed"
  createdAt?: any
}

export default function PlaceOrderPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    customerName: "",
    productName: "",
    quantity: "1",
  })

  const fetchOrders = async () => {
    setLoading(true)
    const snapshot = await getDocs(collection(db, "orders"))
  const data = snapshot.docs.map((doc) => ({
  ...(doc.data() as Order),
  id: doc.id,
}))

    setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleSubmit = async () => {
    const { customerName, productName, quantity } = formData

    if (!customerName || !productName || !quantity) {
      toast({ title: "Vui lòng nhập đầy đủ thông tin" })
      return
    }

    await addDoc(collection(db, "orders"), {
      customerName,
      productName,
      quantity: parseInt(quantity),
      status: "pending",
      createdAt: serverTimestamp(),
    })

    toast({ title: "Đặt hàng thành công!" })

    setFormData({ customerName: "", productName: "", quantity: "1" })
    fetchOrders()
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Đặt hàng</h1>

      {/* ✅ Form đặt hàng */}
      <div className="bg-white p-4 rounded shadow space-y-3 border">
        <h2 className="text-lg font-semibold">Form đặt hàng</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Tên khách hàng"
            value={formData.customerName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, customerName: e.target.value }))
            }
          />
          <Input
            placeholder="Tên sản phẩm"
            value={formData.productName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, productName: e.target.value }))
            }
          />
          <Input
            type="number"
            placeholder="Số lượng"
            value={formData.quantity}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, quantity: e.target.value }))
            }
          />
        </div>
        <Button onClick={handleSubmit}>Thêm đơn hàng</Button>
      </div>

      {/* ✅ Bảng danh sách đơn hàng */}
      <div className="bg-white p-4 rounded shadow border">
        <h2 className="text-lg font-semibold mb-4">Danh sách đơn hàng</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : orders.length === 0 ? (
          <p>Chưa có đơn hàng nào</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.productName}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    {order.status === "completed" ? "Hoàn tất" : "Đang xử lý"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
