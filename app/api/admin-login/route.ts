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

  } catch (error) {
    console.error("🔥 Error initializing Firebase Admin:", JSON.stringify(error, null, 2)); // Log chi tiết hơn
    throw error; // Ném lỗi để xử lý trong API route
  }
}

const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();


    const snapshot = await db.collection("admins").limit(1).get();



    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, message: "No admin found" },
        { status: 404 }
      );
    }

    const admin = snapshot.docs[0].data();
  



    const isMatch = bcrypt.compareSync(password, admin.passwordHash);


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