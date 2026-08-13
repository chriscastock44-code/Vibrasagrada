import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllProducts } from "@/lib/products";
import AdminNav from "@/components/AdminNav";
import CatalogVisibilityManager from "@/components/CatalogVisibilityManager";

export default async function AdminCatalogoPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const products = await getAllProducts();

  return (
    <div>
      <AdminNav />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-heading text-2xl font-extrabold">Catálogo</h1>
        <p className="mt-2 font-body text-sm text-black/60">
          Elige qué productos aparecen en{" "}
          <a
            href="/catalogo"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-brand-navy"
          >
            /catalogo
          </a>{" "}
          (el catálogo privado, solo accesible por enlace). Un producto oculto de la tienda no
          aparece ahí aunque esté marcado, hasta que también lo actives.
        </p>

        {products.length === 0 ? (
          <p className="mt-8 font-body text-black/60">
            Aún no hay productos. Créalos primero desde &ldquo;+ Nuevo producto&rdquo;.
          </p>
        ) : (
          <CatalogVisibilityManager initialProducts={products} />
        )}
      </div>
    </div>
  );
}
