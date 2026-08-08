import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllCustomDesignImages } from "@/lib/customDesignImages";
import AdminNav from "@/components/AdminNav";
import CustomDesignImagesManager from "@/components/CustomDesignImagesManager";

export default async function AdminCustomDesignImagesPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const images = await getAllCustomDesignImages();

  return (
    <div>
      <AdminNav />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-heading text-2xl font-extrabold">
          Carrusel de Diseños personalizados
        </h1>
        <p className="mt-2 max-w-xl font-body text-sm text-black/60">
          Estas fotos aparecen en la sección &ldquo;Diseños
          personalizados&rdquo; de la página principal, entre &ldquo;Qué es
          Vibra Sagrada&rdquo; y &ldquo;Destacados&rdquo;.
        </p>

        <div className="mt-8">
          <CustomDesignImagesManager initialImages={images} />
        </div>
      </div>
    </div>
  );
}
