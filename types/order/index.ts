interface Order {
  id: string
  customerName: string
  productName: string
  quantity: number
  status: "pending" | "completed"
  createdAt: Date
}
