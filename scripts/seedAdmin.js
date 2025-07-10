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
  const email = "bobobo123@gmail.com";
  const plainPassword = "bobobo123";

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(plainPassword, salt);

  const docRef = await db.collection("admins").add({
    email,
    passwordHash,
    createdAt: new Date(),
  });


}

seedAdmin().catch(console.error);
