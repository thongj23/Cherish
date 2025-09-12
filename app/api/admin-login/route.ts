import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import bcrypt from "bcryptjs";

function parseFirebasePrivateKey(): string {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
  const b64 = process.env.FIREBASE_PRIVATE_KEY_BASE64 || "";

  let key = (rawKey || "").trim();
  // Strip surrounding quotes if present
  key = key.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
  // Convert escaped newlines to real newlines
  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");

  if (!key && b64) {
    try {
      key = Buffer.from(b64, "base64").toString("utf8").trim();
    } catch {
      // ignore decode errors
    }
  }

  if (
    !key.startsWith("-----BEGIN PRIVATE KEY-----") ||
    !key.includes("-----END PRIVATE KEY-----")
  ) {
    throw new Error("Invalid PEM key format");
  }

  return key;
}

function getDbOrThrow() {
  try {
    if (!getApps().length) {
      const parsedKey = parseFirebasePrivateKey();

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

    // Set a simple admin session cookie (httpOnly). For production, add Secure and SameSite.
    const res = NextResponse.json({ success: true });
    const isProd = process.env.NODE_ENV === "production";
    res.headers.append(
      "Set-Cookie",
      `admin_session=1; Path=/; HttpOnly; Max-Age=${60 * 60 * 12}; ${isProd ? "Secure; SameSite=Lax;" : ""}`
    );
    return res;
  } catch (err) {
    console.error("🔥 /api/admin-login error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
