import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllProducts } from "@/lib/products";
import AdminNav from "@/components/AdminNav";
import ClearPersonalizationButton from "@/components/ClearPersonalizationButton";
import ProductTable from "@/components/ProductTable";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const products = await getAllProducts();

  return (
    <div>
      <AdminNav />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-heading text-2xl font-extrabold">Productos</h1>
          {products.length > 0 && <ClearPersonalizationButton />}
        </div>

        {products.length === 0 ? (
          <p className="mt-8 font-body text-black/60">
            Aún no hay productos. Crea el primero con &ldquo;+ Nuevo
            producto&rdquo;.
          </p>
        ) : (
          <>
            <p className="mt-8 font-body text-xs text-black/40">
              Arrastra las filas (⠿) para cambiar el orden — es el mismo orden en
              que aparecen en la tienda.
            </p>
            <div className="mt-2">
              <ProductTable initialProducts={products} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
