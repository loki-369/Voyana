import crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function generateToken(payload: object): string {
  // Simple base64 signature for simulation token (production JWT equivalent)
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", process.env.JWT_SECRET || "voyana-secret-key-2026")
    .update(`${header}.${data}`)
    .digest("base64url");
  return `${header}.${data}.${signature}`;
}

export function verifyToken(token: string): any {
  try {
    const [header, data, signature] = token.split(".");
    const expectedSignature = crypto
      .createHmac("sha256", process.env.JWT_SECRET || "voyana-secret-key-2026")
      .update(`${header}.${data}`)
      .digest("base64url");
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    return payload;
  } catch (error) {
    return null;
  }
}
