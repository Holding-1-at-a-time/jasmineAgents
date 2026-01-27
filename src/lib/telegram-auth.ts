/**
 * Validates the data received from the Telegram Mini App using Web Crypto API.
 * This is compatible with Next.js Edge Runtime.
 */
export async function validateWebAppData(initData: string, botToken: string): Promise<boolean> {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;

  // 1. Sort keys alphabetically
  const data: string[] = [];
  params.delete("hash");
  params.sort();
  for (const [key, value] of params.entries()) {
    data.push(`${key}=${value}`);
  }

  const dataCheckString = data.join("\n");

  // 2. Secret key is HMAC-SHA-256 of bot token with constant string "WebAppData"
  const encoder = new TextEncoder();
  const webAppDataKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const secretKeyBuffer = await crypto.subtle.sign(
    "HMAC",
    webAppDataKey,
    encoder.encode(botToken)
  );

  const secretKey = await crypto.subtle.importKey(
    "raw",
    secretKeyBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // 3. Computed hash is HMAC-SHA-256 of dataCheckString with secretKey
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    secretKey,
    encoder.encode(dataCheckString)
  );

  const computedHash = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedHash === hash;
}
