export const sha256Hex = async (text: string): Promise<string> => {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Default password = "ovkb-admin". Override via VITE_ADMIN_PASSWORD_HASH (SHA-256 hex).
export const ADMIN_HASH =
  (import.meta.env.VITE_ADMIN_PASSWORD_HASH as string | undefined) ||
  "e0cce9d9c7be6310193c5b0877a778c253d580ab665577408a1035f4a79b6fb2";
