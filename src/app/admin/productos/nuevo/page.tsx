import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";
import ProductForm from "@/components/ProductForm";

export default async function NewProductPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div>
      <AdminNav />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-heading text-2xl font-extrabold">Nuevo producto</h1>
        <div className="mt-8">
          <ProductForm />
        </div>
      </div>
    </div>
  );
}
