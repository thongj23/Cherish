import admin from "firebase-admin";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";

const serviceAccount = JSON.parse(
  readFileSync("./scripts/serviceAccountKey.json", "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seedAdmin() {
  const email = "admin@example.com";
  const plainPassword = "superSecretPassword123";

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(plainPassword, salt);

  const docRef = await db.collection("admins").add({
    email,
    passwordHash,
    createdAt: new Date(),
  });

  console.log("✅ Admin account created with ID:", docRef.id);
}

seedAdmin().catch(console.error);
