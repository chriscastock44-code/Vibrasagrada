import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllBpUpcomingItems } from "@/lib/bpUpcomingItems";
import { getAllBpProductPhotos } from "@/lib/bpProductPhotos";
import AdminNav from "@/components/AdminNav";
import BpUpcomingItemsManager from "@/components/BpUpcomingItemsManager";
import BpProductPhotosManager from "@/components/BpProductPhotosManager";

export default async function AdminBarksAndPawsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [items, photos] = await Promise.all([
    getAllBpUpcomingItems(),
    getAllBpProductPhotos(),
  ]);

  return (
    <div>
      <AdminNav />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-heading text-2xl font-extrabold">Barks &amp; Paws</h1>
        <p className="mt-2 max-w-xl font-body text-sm text-black/60">
          Administra el contenido de{" "}
          <a href="/barks-and-paws" target="_blank" className="underline hover:text-brand-navy">
            la landing de Barks &amp; Paws
          </a>
          .
        </p>

        <section className="mt-10">
          <h2 className="font-heading text-lg font-extrabold">&ldquo;Lo que viene&rdquo;</h2>
          <p className="mt-1 max-w-xl font-body text-sm text-black/60">
            Las tarjetas que aparecen en esa sección — cada una con su propia foto, título y
            descripción.
          </p>
          <div className="mt-6">
            <BpUpcomingItemsManager initialItems={items} />
          </div>
        </section>

        <section className="mt-14 border-t-2 border-brand-black/10 pt-10">
          <h2 className="font-heading text-lg font-extrabold">&ldquo;Productos ya hechos&rdquo;</h2>
          <p className="mt-1 max-w-xl font-body text-sm text-black/60">
            El carrusel de fotos de productos que ya existen, para mostrar lo que ya se puede
            personalizar.
          </p>
          <div className="mt-6">
            <BpProductPhotosManager initialPhotos={photos} />
          </div>
        </section>
      </div>
    </div>
  );
}
