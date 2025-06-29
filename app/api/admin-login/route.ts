// app/api/admin-login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import bcrypt from "bcryptjs";

// ❌ KHÔNG import file JSON nữa!
// ✅ Dùng biến môi trường thay thế
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const snapshot = await db.collection("admins").limit(1).get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, message: "No admin found" },
        { status: 401 }
      );
    }
    const admin = snapshot.docs[0].data();
    if (!bcrypt.compareSync(password, admin.passwordHash)) {
      return NextResponse.json(
        { success: false, message: "Wrong password" },
        { status: 401 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥11 /api/admin-login error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
