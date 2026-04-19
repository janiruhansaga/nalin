import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Plus, Download, LogOut, Upload, ImagePlus } from "lucide-react";
import { ADMIN_HASH, sha256Hex } from "@/lib/hash";
import {
  Catalog,
  Product,
  loadDraft,
  saveDraft,
  clearDraft,
} from "@/hooks/useProducts";
import { PRODUCTS as SEED_PRODUCTS, WHATSAPP_NUMBER as SEED_NUMBER } from "@/data/config";

const SESSION_KEY = "ovkb_admin_session";

// Slugify filename for safe paths in /public/cards/
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "card";

// Pending uploads kept in memory (not in localStorage — files can be huge).
// Map by image_url key (which we set to "cards/<filename>").
type PendingFile = { file: File; previewUrl: string };

const Admin = () => {
  const [authed, setAuthed] = useState<boolean>(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [password, setPassword] = useState("");
  const [catalog, setCatalog] = useState<Catalog>(() => {
    const d = loadDraft();
    return d ?? { whatsapp_number: SEED_NUMBER, products: [...SEED_PRODUCTS] };
  });
  const pendingRef = useRef<Map<string, PendingFile>>(new Map());
  const [, forceTick] = useState(0);
  const bump = () => forceTick((n) => n + 1);

  useEffect(() => {
    document.title = "Admin — Designs by OVKB";
  }, []);

  useEffect(() => {
    if (!authed || loadDraft()) return;
    const base = import.meta.env.BASE_URL || "/";
    fetch(`${base}products.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Catalog | null) => {
        if (data && Array.isArray(data.products)) setCatalog(data);
      })
      .catch(() => {});
  }, [authed]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      pendingRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const hash = await sha256Hex(password);
    if (hash === ADMIN_HASH) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      setPassword("");
      toast.success("Welcome back, Oshadha.");
    } else {
      toast.error("Incorrect password.");
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };

  const nextId = () => catalog.products.reduce((m, p) => Math.max(m, p.id), 0) + 1;

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;
    const newProducts: Product[] = [];
    let id = nextId();
    for (const file of arr) {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const baseName = slugify(file.name.replace(/\.[^.]+$/, ""));
      const path = `cards/${id}-${baseName}.${ext}`;
      const previewUrl = URL.createObjectURL(file);
      pendingRef.current.set(path, { file, previewUrl });
      newProducts.push({ id, title: baseName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), image_url: path });
      id++;
    }
    setCatalog((c) => ({ ...c, products: [...c.products, ...newProducts] }));
    toast.success(`Added ${newProducts.length} image${newProducts.length > 1 ? "s" : ""}.`);
  };

  const replaceImage = (productId: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    const product = catalog.products.find((p) => p.id === productId);
    if (!product) return;
    // free old blob if it was pending
    const oldPending = pendingRef.current.get(product.image_url);
    if (oldPending) {
      URL.revokeObjectURL(oldPending.previewUrl);
      pendingRef.current.delete(product.image_url);
    }
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const baseName = slugify(product.title || file.name.replace(/\.[^.]+$/, ""));
    const path = `cards/${productId}-${baseName}.${ext}`;
    pendingRef.current.set(path, { file, previewUrl: URL.createObjectURL(file) });
    updateProduct(productId, { image_url: path });
  };

  const updateProduct = (id: number, patch: Partial<Product>) => {
    setCatalog((c) => ({ ...c, products: c.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  };

  const removeProduct = (id: number) => {
    const product = catalog.products.find((p) => p.id === id);
    if (product) {
      const pending = pendingRef.current.get(product.image_url);
      if (pending) {
        URL.revokeObjectURL(pending.previewUrl);
        pendingRef.current.delete(product.image_url);
      }
    }
    setCatalog((c) => ({ ...c, products: c.products.filter((p) => p.id !== id) }));
  };

  const saveLocal = () => {
    saveDraft(catalog);
    toast.success("Draft saved (text only — re-add images before exporting).");
  };

  const resetDraft = () => {
    pendingRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
    pendingRef.current.clear();
    clearDraft();
    toast.success("Draft cleared. Reload to refetch live data.");
  };

  const exportZip = async () => {
    const zip = new JSZip();
    zip.file("products.json", JSON.stringify(catalog, null, 2));
    const cardsFolder = zip.folder("cards");
    if (cardsFolder) {
      for (const [path, { file }] of pendingRef.current.entries()) {
        const filename = path.replace(/^cards\//, "");
        cardsFolder.file(filename, file);
      }
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ovkb-public.zip";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ZIP downloaded — unzip into /public/ in your repo.");
  };

  // Resolve <img src> for previewing inside admin
  const resolveSrc = (image_url: string): string => {
    if (!image_url) return "";
    const pending = pendingRef.current.get(image_url);
    if (pending) return pending.previewUrl;
    if (image_url.startsWith("http://") || image_url.startsWith("https://") || image_url.startsWith("data:")) {
      return image_url;
    }
    // Relative path → resolve against site base
    const base = import.meta.env.BASE_URL || "/";
    return `${base}${image_url.replace(/^\//, "")}`;
  };

  const productCount = useMemo(() => catalog.products.length, [catalog]);
  const pendingCount = pendingRef.current.size;

  // Drag & drop on whole drop zone
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  if (!authed) {
    return (
      <main className="min-h-screen bg-warm-gradient flex items-center justify-center px-6">
        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm bg-card p-10 shadow-soft"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-accent mb-3 text-center">Admin</p>
          <h1 className="font-serif text-3xl text-center mb-8">Quiet Studio</h1>
          <Label htmlFor="pw" className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Password
          </Label>
          <Input
            id="pw"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 mb-6"
          />
          <Button type="submit" className="w-full">Enter</Button>
        </motion.form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-accent">Admin</p>
            <h1 className="font-serif text-2xl">Manage Catalog</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {pendingCount} new file{pendingCount === 1 ? "" : "s"} pending
            </span>
            <Button variant="outline" size="sm" onClick={resetDraft}>Clear draft</Button>
            <Button variant="outline" size="sm" onClick={saveLocal}>Save draft</Button>
            <Button size="sm" onClick={exportZip}>
              <Download className="size-4" /> Export ZIP
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-card p-6 mb-8 shadow-card">
          <Label htmlFor="wa" className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            WhatsApp number (international, no +)
          </Label>
          <Input
            id="wa"
            value={catalog.whatsapp_number}
            onChange={(e) => setCatalog((c) => ({ ...c, whatsapp_number: e.target.value }))}
            className="mt-2 max-w-sm"
            placeholder="947XXXXXXXX"
          />
        </div>

        {/* Drop zone */}
        <div
          ref={dropRef}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`mb-8 border-2 border-dashed transition-colors ${
            dragOver ? "border-accent bg-accent/5" : "border-border"
          } p-10 text-center`}
        >
          <ImagePlus className="size-8 mx-auto mb-3 text-muted-foreground" />
          <p className="font-serif text-xl mb-1">Drop card images here</p>
          <p className="text-sm text-muted-foreground mb-4">or click to choose files (JPG, PNG, WEBP)</p>
          <label className="inline-flex">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <span className="cursor-pointer inline-flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
              <Upload className="size-4" /> Choose images
            </span>
          </label>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl">
            Cards <span className="text-muted-foreground text-sm">({productCount})</span>
          </h2>
        </div>

        <div className="grid gap-4">
          {catalog.products.map((p) => {
            const isPending = pendingRef.current.has(p.image_url);
            return (
              <div
                key={p.id}
                className="bg-card p-4 shadow-card grid grid-cols-1 md:grid-cols-[140px_1fr_auto] gap-4 items-center"
              >
                <div className="aspect-square bg-muted overflow-hidden relative group">
                  {p.image_url ? (
                    <img src={resolveSrc(p.image_url)} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                  <label className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) replaceImage(p.id, f);
                        e.target.value = "";
                      }}
                    />
                    <span className="opacity-0 group-hover:opacity-100 text-background text-xs tracking-[0.2em] uppercase">
                      Replace
                    </span>
                  </label>
                </div>
                <div className="grid gap-2">
                  <Input
                    value={p.title}
                    onChange={(e) => updateProduct(p.id, { title: e.target.value })}
                    placeholder="Card title"
                  />
                  <p className="text-[11px] text-muted-foreground font-mono truncate">
                    {isPending ? (
                      <span className="text-accent">● pending upload</span>
                    ) : (
                      "live"
                    )}
                    {" · "}
                    {p.image_url || "(no path)"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeProduct(p.id)} aria-label="Remove">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-10 p-6 bg-muted/40 border border-border/50 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">How publishing works</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Drop images above — each becomes a card with an editable title.</li>
            <li>Click <span className="text-foreground">Export ZIP</span>. You'll get <span className="font-mono">ovkb-public.zip</span> containing <span className="font-mono">products.json</span> and a <span className="font-mono">cards/</span> folder.</li>
            <li>Unzip its contents into <span className="font-mono">/public/</span> in your GitHub repo (overwriting <span className="font-mono">products.json</span>) and push. GitHub Pages rebuilds and the new cards appear live.</li>
          </ol>
        </div>
      </section>
    </main>
  );
};

export default Admin;
