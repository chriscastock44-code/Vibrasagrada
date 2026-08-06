import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllInstagramPosts } from "@/lib/instagramPosts";
import AdminNav from "@/components/AdminNav";
import InstagramPostsManager from "@/components/InstagramPostsManager";

export default async function AdminInstagramPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const posts = await getAllInstagramPosts();

  return (
    <div>
      <AdminNav />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-heading text-2xl font-extrabold">
          Carrusel de Instagram
        </h1>
        <p className="mt-2 max-w-xl font-body text-sm text-black/60">
          Estas fotos aparecen en la sección &ldquo;Síguenos en
          Instagram&rdquo; de la página principal. Súbelas tú mismo cuando
          quieras actualizarlas — no se jalan automáticamente de tu cuenta de
          Instagram.
        </p>

        <div className="mt-8">
          <InstagramPostsManager initialPosts={posts} />
        </div>
      </div>
    </div>
  );
}
