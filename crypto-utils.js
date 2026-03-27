/* =============================================
   HERWORTH — CLIENT-SIDE ENCRYPTION UTILS
   AES-GCM 256-bit encryption for localStorage data.
   The encryption key is derived from the user's UID
   via PBKDF2 so data is useless without auth.
   ============================================= */

const SALT = "herworth_v1_salt_2026"; // non-secret, constant salt for key derivation

async function deriveKey(uid) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(uid + SALT), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode(SALT), iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(uid, data) {
  const key = await deriveKey(uid);
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(JSON.stringify(data))
  );
  // Store iv + ciphertext as base64
  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptData(uid, encoded) {
  try {
    const key = await deriveKey(uid);
    const combined = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch {
    return null;
  }
}

// Encrypted localStorage wrappers
export async function secureSet(uid, key, value) {
  const encrypted = await encryptData(uid, value);
  localStorage.setItem("hw_enc_" + key, encrypted);
}

export async function secureGet(uid, key) {
  const raw = localStorage.getItem("hw_enc_" + key);
  if (!raw) return null;
  return decryptData(uid, raw);
}

export function secureDel(key) {
  localStorage.removeItem("hw_enc_" + key);
}
