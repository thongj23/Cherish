import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import bcrypt from "bcryptjs";

function getDbOrThrow() {
  try {
    if (!getApps().length) {
      const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
      const parsedKey = rawKey
        .replace(/^\"|\"$/g, "")
        .replace(/\\n/g, "\n")
        .trim();

      if (
        !parsedKey.startsWith("-----BEGIN PRIVATE KEY-----") ||
        !parsedKey.endsWith("-----END PRIVATE KEY-----")
      ) {
        throw new Error("Invalid PEM key format");
      }

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: parsedKey,
        }),
      });
    }
    return getFirestore();
  } catch (error) {
    console.error(
      "🔥 Error initializing Firebase Admin:",
      JSON.stringify(error, null, 2)
    );
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDbOrThrow();
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
