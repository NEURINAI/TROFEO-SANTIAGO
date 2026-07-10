import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// Devuelve el payload del administrador autenticado, o null si no hay sesión válida.
// Verifica realmente la firma y caducidad del JWT (no solo la presencia de la cookie).
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
