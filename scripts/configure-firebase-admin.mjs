#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function readBase64Json(filePath) {
  const b64 = fs.readFileSync(filePath, 'utf8').trim();
  const jsonStr = Buffer.from(b64, 'base64').toString('utf8');
  return JSON.parse(jsonStr);
}

function updateEnv(envPath, updates) {
  let content = '';
  try { content = fs.readFileSync(envPath, 'utf8'); } catch {}

  const lines = content.split(/\r?\n/);
  const skipKeys = new Set([
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_PRIVATE_KEY_BASE64',
  ]);

  const kept = lines.filter(l => {
    const m = l.match(/^([A-Z0-9_]+)=/);
    if (!m) return true;
    return !skipKeys.has(m[1]);
  });

  const append = [];
  if (updates.projectId) append.push(`FIREBASE_PROJECT_ID=${updates.projectId}`);
  if (updates.clientEmail) append.push(`FIREBASE_CLIENT_EMAIL=${updates.clientEmail}`);
  if (updates.privateKeyB64) append.push(`FIREBASE_PRIVATE_KEY_BASE64=${updates.privateKeyB64}`);

  const next = [...kept, '', ...append].join('\n').replace(/\n+$/,'\n');
  fs.writeFileSync(envPath, next, 'utf8');
}

function main() {
  const baseDir = process.cwd();
  const source = process.argv[2] || path.join(baseDir, 'svc-base64.txt');
  const envPath = process.argv[3] || path.join(baseDir, '.env');

  if (!fs.existsSync(source)) {
    console.error(`Source not found: ${source}`);
    process.exit(1);
  }

  const obj = readBase64Json(source);
  const privateKey = obj.private_key;
  const clientEmail = obj.client_email;
  const projectId = obj.project_id;

  if (!privateKey || !clientEmail || !projectId) {
    console.error('Missing fields in service account JSON (need private_key, client_email, project_id).');
    process.exit(1);
  }

  const privateKeyB64 = Buffer.from(privateKey, 'utf8').toString('base64');
  updateEnv(envPath, {
    privateKeyB64,
    clientEmail,
    projectId,
  });

  console.log(`Updated ${path.relative(baseDir, envPath)} with FIREBASE_PRIVATE_KEY_BASE64, project id and client email.`);
}

main();

