export type PersonalizationFieldType = "text" | "select" | "image" | "textarea";

export type ProductCategory = "tote" | "playera";

export interface PersonalizationField {
  id: string;
  type: PersonalizationFieldType;
  label: string;
  required?: boolean;
  maxLength?: number;
  options?: string[]; // for "select"
  helpText?: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  priceCents: number; // price stored in cents to avoid float issues
  currency: string; // e.g. "MXN"
  images: string[];
  personalizationFields: PersonalizationField[];
  stock: number;
  active: boolean;
  featured: boolean;
  category: ProductCategory;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency?: string;
  images: string[];
  personalizationFields: PersonalizationField[];
  stock: number;
  active: boolean;
  featured?: boolean;
  category?: ProductCategory;
}

export interface InstagramPost {
  id: number;
  imageUrl: string;
  link: string;
  sortOrder: number;
  createdAt: string;
}

// Fotos del carrusel de "Diseños personalizados" en el home — independiente
// del carrusel de Instagram y de las imágenes de producto.
export interface CustomDesignImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

// Tarjetas de "Lo que viene" en la landing de Barks & Paws — cada una tiene
// su propia foto y texto, a diferencia del carrusel de Diseños
// personalizados (que es solo fotos).
export interface BpUpcomingItem {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  sortOrder: number;
  createdAt: string;
}

// Fotos del carrusel de "Productos ya hechos" en la landing de Barks & Paws.
export interface BpProductPhoto {
  id: number;
  imageUrl: string;
  caption: string;
  sortOrder: number;
  createdAt: string;
}

export interface CartPersonalization {
  [fieldId: string]: string;
}

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  image?: string;
  quantity: number;
  personalization: CartPersonalization;
}
