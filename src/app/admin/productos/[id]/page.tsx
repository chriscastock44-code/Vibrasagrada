import { redirect, notFound } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getProductById } from "@/lib/products";
import AdminNav from "@/components/AdminNav";
import ProductForm from "@/components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) {
    notFound();
  }

  return (
    <div>
      <AdminNav />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-heading text-2xl font-extrabold">Editar producto</h1>
        <div className="mt-8">
          <ProductForm initialProduct={product} />
        </div>
      </div>
    </div>
  );
}
