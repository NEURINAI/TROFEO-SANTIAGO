import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AdminSidebar from "@/components/AdminSidebar";

export const dynamic = "force-dynamic";

async function logout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

export default async function AdminLayout({ children }) {
  const session = await getSession();
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const isLogin = pathname.endsWith("/admin/login");

  // Página de login: sin sesión válida, se muestra sin el panel de mando.
  if (isLogin) {
    if (session) redirect("/admin");
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Resto de rutas admin: exigir sesión válida (verificación real del JWT).
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar logoutAction={logout} />
      <div className="pt-12 lg:pl-64">
        <main className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
