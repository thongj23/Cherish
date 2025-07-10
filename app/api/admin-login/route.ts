import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import bcrypt from "bcryptjs";

// Xử lý khóa riêng
const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
const parsedKey = rawKey
  .replace(/^"|"$/g, "") // Loại bỏ dấu ngoặc kép ở đầu và cuối
  .replace(/\\n/g, "\n") // Thay \n bằng dòng mới thực sự
  .trim(); // Loại bỏ khoảng trắng thừa

// Kiểm tra định dạng PEM
if (!parsedKey.startsWith("-----BEGIN PRIVATE KEY-----") || !parsedKey.endsWith("-----END PRIVATE KEY-----")) {
  console.error("🔥 Invalid PEM key format in FIREBASE_PRIVATE_KEY");
  throw new Error("Invalid PEM key format");
}

// Kiểm tra biến môi trường
console.log("🗝️ ENV CHECK:", {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKeyExists: !!process.env.FIREBASE_PRIVATE_KEY,
});

// Không ghi log RAW và PARSED trong môi trường production để tránh rò rỉ thông tin
if (process.env.NODE_ENV !== "production") {
  console.log("🚩 PARSED:", parsedKey.slice(0, 50) + "..." + parsedKey.slice(-50)); // Ghi log an toàn hơn
}

// Khởi tạo Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: parsedKey,
      }),
    });
    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("🔥 Error initializing Firebase Admin:", JSON.stringify(error, null, 2)); // Log chi tiết hơn
    throw error; // Ném lỗi để xử lý trong API route
  }
}

const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    console.log("📥 Received password:", password);

    const snapshot = await db.collection("admins").limit(1).get();

    console.log("📄 Admin snapshot empty?", snapshot.empty);

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, message: "No admin found" },
        { status: 404 }
      );
    }

    const admin = snapshot.docs[0].data();
    console.log("👤 Admin data:", admin);

    console.log("🔑 Admin.passwordHash:", admin.passwordHash);

    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    console.log("✅ Compare result:", isMatch);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Wrong password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 /api/admin-login error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}