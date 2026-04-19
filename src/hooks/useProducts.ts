import { useEffect, useState } from "react";
import { PRODUCTS as FALLBACK_PRODUCTS, WHATSAPP_NUMBER as FALLBACK_NUMBER } from "@/data/config";

export type Product = { id: number; title: string; image_url: string };
export type Catalog = { whatsapp_number: string; products: Product[] };

const LS_KEY = "ovkb_catalog_draft";

export const loadDraft = (): Catalog | null => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Catalog) : null;
  } catch {
    return null;
  }
};

export const saveDraft = (catalog: Catalog) => {
  localStorage.setItem(LS_KEY, JSON.stringify(catalog));
};

export const clearDraft = () => localStorage.removeItem(LS_KEY);

/**
 * Public catalog: fetches /products.json (committed file).
 * Admin draft (localStorage) is NOT used here — public visitors always see
 * the deployed file. Admin page uses loadDraft() directly.
 */
export const useCatalog = (): Catalog => {
  const [catalog, setCatalog] = useState<Catalog>({
    whatsapp_number: FALLBACK_NUMBER,
    products: FALLBACK_PRODUCTS,
  });

  useEffect(() => {
    const base = import.meta.env.BASE_URL || "/";
    fetch(`${base}products.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Catalog | null) => {
        if (data && Array.isArray(data.products)) setCatalog(data);
      })
      .catch(() => {
        /* keep fallback */
      });
  }, []);

  return catalog;
};
