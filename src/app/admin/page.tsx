import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import AdminNav from "@/components/AdminNav";
import DeleteProductButton from "@/components/DeleteProductButton";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const products = getAllProducts();

  return (
    <div>
      <AdminNav />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Productos</h1>

        {products.length === 0 ? (
          <p className="mt-8 text-black/60">
            Aún no hay productos. Crea el primero con &ldquo;+ Nuevo
            producto&rdquo;.
          </p>
        ) : (
          <table className="mt-8 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-black/50">
                <th className="py-2">Producto</th>
                <th className="py-2">Precio</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Estado</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-black/5">
                  <td className="py-3">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-black/40">/{product.slug}</p>
                  </td>
                  <td className="py-3">
                    {formatPrice(product.priceCents, product.currency)}
                  </td>
                  <td className="py-3">{product.stock}</td>
                  <td className="py-3">
                    {product.active ? (
                      <span className="text-green-700">Publicado</span>
                    ) : (
                      <span className="text-black/40">Oculto</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="text-sm underline hover:opacity-70"
                    >
                      Editar
                    </Link>
                    <DeleteProductButton productId={product.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
