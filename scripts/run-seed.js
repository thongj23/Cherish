// Script để chạy seed data từ browser console hoặc admin page
import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore"
import { db } from "../lib/firebase.js"

export const mockProducts = [
  {
    name: "Xịt tạo phồng tóc LagoonHairTonic",
    description:
      "Xịt tạo phồng tóc chuyên nghiệp, giúp tóc bồng bềnh tự nhiên suốt cả ngày. Công thức không gây bết dính.",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    price: 299000,
    category: "Chăm sóc tóc",
    featured: true,
  },
  {
    name: "Serum dưỡng tóc Argan Oil",
    description: "Serum phục hồi tóc hư tổn với tinh dầu Argan Morocco. Giúp tóc mềm mượt, bóng khỏe từ gốc đến ngọn.",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop",
    price: 450000,
    category: "Chăm sóc tóc",
    featured: true,
  },
  {
    name: "Dầu gội phục hồi tóc hư tổn",
    description:
      "Dầu gội chuyên sâu cho tóc khô xơ, hư tổn. Chứa keratin và protein tự nhiên giúp phục hồi cấu trúc tóc.",
    imageUrl: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop",
    price: 180000,
    category: "Chăm sóc tóc",
    featured: false,
  },
  {
    name: "Mặt nạ dưỡng ẩm Hyaluronic Acid",
    description: "Mặt nạ giấy cấp ẩm tức thì với Hyaluronic Acid. Giúp da căng mịn, tươi trẻ chỉ sau 15 phút.",
    imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop",
    price: 25000,
    category: "Chăm sóc da",
    featured: false,
  },
  {
    name: "Kem chống nắng SPF 50+ PA+++",
    description: "Kem chống nắng phổ rộng, bảo vệ da khỏi tia UV. Công thức nhẹ tênh, không gây nhờn rít.",
    imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop",
    price: 320000,
    category: "Chăm sóc da",
    featured: true,
  },
  {
    name: "Toner cân bằng pH Rose Water",
    description: "Nước hoa hồng tự nhiên giúp cân bằng độ pH, se khít lỗ chân lông và cấp ẩm cho da.",
    imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&h=400&fit=crop",
    price: 150000,
    category: "Chăm sóc da",
    featured: false,
  },
  {
    name: "Sữa rửa mặt tạo bọt Vitamin C",
    description: "Sữa rửa mặt làm sạch sâu với Vitamin C. Giúp làm sáng da và loại bỏ tế bào chết hiệu quả.",
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    price: 95000,
    category: "Chăm sóc da",
    featured: false,
  },
  {
    name: "Tinh chất dưỡng mi Lash Serum",
    description: "Tinh chất kích thích mọc mi, giúp mi dài và dày tự nhiên. Công thức an toàn cho vùng mắt nhạy cảm.",
    imageUrl: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=400&h=400&fit=crop",
    price: 680000,
    category: "Trang điểm",
    featured: true,
  },
  {
    name: "Son dưỡng có màu Berry Tint",
    description: "Son dưỡng có màu tự nhiên, lâu trôi. Công thức dưỡng ẩm giúp môi mềm mịn suốt ngày dài.",
    imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
    price: 120000,
    category: "Trang điểm",
    featured: false,
  },
  {
    name: "Phấn phủ kiềm dầu Oil Control",
    description: "Phấn phủ bột mịn giúp kiềm dầu và cố định lớp makeup. Cho lớp nền mịn màng, tự nhiên.",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
    price: 280000,
    category: "Trang điểm",
    featured: false,
  },
]

export async function seedMockData() {
  try {


    // Xóa dữ liệu cũ
    const productsCollection = collection(db, "products")
    const snapshot = await getDocs(productsCollection)
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)


    // Thêm sản phẩm mới
    for (const product of mockProducts) {
      await addDoc(productsCollection, {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }


    return { success: true, count: mockProducts.length }
  } catch (error) {
    console.error("❌ Lỗi khi đổ dữ liệu:", error)
    return { success: false, error: error.message }
  }
}
