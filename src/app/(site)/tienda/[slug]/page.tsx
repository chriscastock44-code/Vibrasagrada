import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import AddToCartForm from "@/components/AddToCartForm";
import BackButton from "@/components/BackButton";
import ProductGallery from "@/components/ProductGallery";

// Products are managed through /admin and can change at any time, so this
// page must not be cached as static HTML at build time.
export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.active) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <BackButton />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="w-full self-start">
          <ProductGallery images={product.images} alt={product.name} />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold">{product.name}</h1>
          <p className="mt-2 font-heading text-xl font-bold text-brand-navy">
            {formatPrice(product.priceCents, product.currency)}
          </p>
          <p className="mt-6 whitespace-pre-line font-body text-black/60">
            {product.description}
          </p>

          <div className="mt-10">
            <AddToCartForm product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
