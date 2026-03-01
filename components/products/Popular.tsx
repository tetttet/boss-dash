"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Loader2,
  Pencil,
  Save,
  X,
  Trash2,
  Image as ImageIcon,
  Link as LinkIcon,
  Package,
} from "lucide-react";
import { API_BASE_URL } from "@/context/api";

type Product = {
  id: string;

  en_name: string;
  ar_name: string;
  tr_name: string;

  en_description?: string | null;
  ar_description?: string | null;
  tr_description?: string | null;

  en_highlights?: string | null;
  ar_highlights?: string | null;
  tr_highlights?: string | null;

  en_usage?: string | null;
  ar_usage?: string | null;
  tr_usage?: string | null;

  price: number;
  currency: string;

  thumbnail?: string | null;
  image?: string | null;

  stock: number;
  gallery: string[];
};

type ProductsListResponse =
  | { items: Product[]; total?: number; limit?: number; offset?: number }
  | Product[];

const PRODUCTS_ENDPOINT = `${API_BASE_URL}/api/products`;

// --- helpers
const isLikelyUrl = (s: string) => {
  if (!s) return true;
  try {
    if (s.startsWith("/")) return true;
    new URL(s);
    return true;
  } catch {
    return false;
  }
};

const cleanText = (v: unknown) => {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const s = String(v);
  const trimmed = s.trim();
  return trimmed === "" ? null : trimmed;
};

const cleanGallery = (g: unknown) =>
  Array.isArray(g) ? g.map((x) => String(x ?? "").trim()).filter(Boolean) : [];

function splitHighlights(text?: string | null) {
  if (!text) return [];
  return text
    .split("\n\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

// --- Editor payload (PATCH)
type ProductUpdatePayload = Partial<Omit<Product, "id">>;

// --- Edit dialog component
function EditProductDialog({
  open,
  onOpenChange,
  product,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  product: Product | null;
  onSaved: (next: Product) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [inStock, setInStock] = useState(true);

  const { register, handleSubmit, reset, watch, formState } =
    useForm<ProductUpdatePayload>({
      defaultValues: {},
      mode: "onChange",
    });

  useEffect(() => {
    if (!product) return;

    reset({
      en_name: product.en_name,
      tr_name: product.tr_name,
      ar_name: product.ar_name,

      en_description: product.en_description ?? null,
      tr_description: product.tr_description ?? null,
      ar_description: product.ar_description ?? null,

      en_highlights: product.en_highlights ?? null,
      tr_highlights: product.tr_highlights ?? null,
      ar_highlights: product.ar_highlights ?? null,

      en_usage: product.en_usage ?? null,
      tr_usage: product.tr_usage ?? null,
      ar_usage: product.ar_usage ?? null,

      price: product.price,
      currency: product.currency,

      thumbnail: product.thumbnail ?? null,
      image: product.image ?? null,

      stock: product.stock,
    });

    setGallery(product.gallery ?? []);
    setInStock((product.stock ?? 0) > 0);
  }, [product, reset]);

  const thumbnail = watch("thumbnail") as unknown;
  const image = watch("image") as unknown;
  const currency = (watch("currency") as unknown) ?? "TRY";
  const price = watch("price") as unknown;
  const stock = watch("stock") as unknown;
  const urlWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (!isLikelyUrl(String(thumbnail ?? "")))
      warnings.push("Thumbnail URL looks invalid.");
    if (!isLikelyUrl(String(image ?? "")))
      warnings.push("Main image URL looks invalid.");
    const badGallery = gallery.filter((g) => !isLikelyUrl(g));
    if (badGallery.length)
      warnings.push(`Some gallery URLs look invalid (${badGallery.length}).`);
    return warnings;
  }, [thumbnail, image, gallery]);

  const addGalleryRow = () => setGallery((prev) => [...prev, ""]);
  const removeGalleryRow = (idx: number) =>
    setGallery((prev) => prev.filter((_, i) => i !== idx));
  const updateGalleryRow = (idx: number, val: string) =>
    setGallery((prev) => prev.map((x, i) => (i === idx ? val : x)));

  const onSubmit = async (data: ProductUpdatePayload) => {
    if (!product) return;

    try {
      setSubmitting(true);

      const payload: ProductUpdatePayload = {
        ...data,
        en_description: cleanText(data.en_description),
        tr_description: cleanText(data.tr_description),
        ar_description: cleanText(data.ar_description),

        en_highlights: cleanText(data.en_highlights),
        tr_highlights: cleanText(data.tr_highlights),
        ar_highlights: cleanText(data.ar_highlights),

        en_usage: cleanText(data.en_usage),
        tr_usage: cleanText(data.tr_usage),
        ar_usage: cleanText(data.ar_usage),

        thumbnail: cleanText(data.thumbnail),
        image: cleanText(data.image),

        price: typeof data.price === "number" ? data.price : Number(data.price),
        stock: inStock ? Number(data.stock ?? 0) : 0,
        currency: String(data.currency ?? "TRY").trim() || "TRY",

        gallery: cleanGallery(gallery),
      };

      if (!payload.en_name || !payload.tr_name || !payload.ar_name) {
        toast.error("Fill EN/TR/AR names.");
        return;
      }
      if (
        !Number.isFinite(payload.price as number) ||
        (payload.price as number) < 0
      ) {
        toast.error("Price must be a valid non-negative number.");
        return;
      }
      if (
        !Number.isFinite(payload.stock as number) ||
        (payload.stock as number) < 0
      ) {
        toast.error("Stock must be a valid non-negative number.");
        return;
      }

      const res = await fetch(`${PRODUCTS_ENDPOINT}/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Update failed (${res.status})`);
      }

      toast.success("Product updated");
      onSaved(json as Product);
      onOpenChange(false);
    } catch (e: unknown) {
      const error = e as { message?: string } | null;
      toast.error(error?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const mainImg = String(image || thumbnail || gallery?.[0] || "");

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit product
          </DialogTitle>
          <DialogDescription>
            Update any field and save (PATCH). URLs only (no file uploads).
          </DialogDescription>
        </DialogHeader>

        {!product ? (
          <div className="py-8 text-sm text-muted-foreground">
            No product selected.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* LEFT */}
            {/* <div className="space-y-6">
              {urlWarnings.length > 0 ? (
                <Alert>
                  <AlertTitle className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    URL check
                  </AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5">
                      {urlWarnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : null}

              <Card>
                <CardHeader>
                  <CardTitle>Titles</CardTitle>
                  <CardDescription>EN / TR / AR (required)</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>English</Label>
                    <Input {...register("en_name", { required: true })} />
                    {formState.errors.en_name ? (
                      <p className="text-xs text-destructive">Required</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Türkçe</Label>
                    <Input {...register("tr_name", { required: true })} />
                    {formState.errors.tr_name ? (
                      <p className="text-xs text-destructive">Required</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>العربية</Label>
                    <Input
                      dir="rtl"
                      {...register("ar_name", { required: true })}
                    />
                    {formState.errors.ar_name ? (
                      <p className="text-xs text-destructive">Required</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                  <CardDescription>
                    Description / Highlights / Usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="en">
                    <TabsList className="mb-4">
                      <TabsTrigger value="en">EN</TabsTrigger>
                      <TabsTrigger value="tr">TR</TabsTrigger>
                      <TabsTrigger value="ar">AR</TabsTrigger>
                    </TabsList>

                    <TabsContent value="en" className="space-y-4">
                      <div className="space-y-2">
                        <Label>EN description</Label>
                        <Textarea rows={5} {...register("en_description")} />
                      </div>
                      <div className="space-y-2">
                        <Label>EN highlights</Label>
                        <Textarea rows={6} {...register("en_highlights")} />
                        <p className="text-xs text-muted-foreground">
                          Tip: separate blocks with blank lines.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>EN usage</Label>
                        <Textarea rows={6} {...register("en_usage")} />
                      </div>
                    </TabsContent>

                    <TabsContent value="tr" className="space-y-4">
                      <div className="space-y-2">
                        <Label>TR description</Label>
                        <Textarea rows={5} {...register("tr_description")} />
                      </div>
                      <div className="space-y-2">
                        <Label>TR highlights</Label>
                        <Textarea rows={6} {...register("tr_highlights")} />
                      </div>
                      <div className="space-y-2">
                        <Label>TR usage</Label>
                        <Textarea rows={6} {...register("tr_usage")} />
                      </div>
                    </TabsContent>

                    <TabsContent value="ar" className="space-y-4">
                      <div className="space-y-2">
                        <Label>AR description</Label>
                        <Textarea
                          dir="rtl"
                          rows={5}
                          {...register("ar_description")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>AR highlights</Label>
                        <Textarea
                          dir="rtl"
                          rows={6}
                          {...register("ar_highlights")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>AR usage</Label>
                        <Textarea
                          dir="rtl"
                          rows={6}
                          {...register("ar_usage")}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Media URLs
                  </CardTitle>
                  <CardDescription>
                    Paste URLs / relative paths.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Thumbnail</Label>
                      <Input
                        placeholder="/images/..."
                        {...register("thumbnail")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Main image</Label>
                      <Input placeholder="/img/..." {...register("image")} />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Gallery</Label>
                        <p className="text-xs text-muted-foreground">
                          Multiple image URLs
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addGalleryRow}
                      >
                        Add
                      </Button>
                    </div>

                    {gallery.length === 0 ? (
                      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                        No gallery images.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {gallery.map((g, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              value={g}
                              onChange={(e) =>
                                updateGalleryRow(idx, e.target.value)
                              }
                              placeholder="/images/products/..."
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeGalleryRow(idx)}
                              aria-label="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div> */}

            {/* RIGHT */}
            <div className="space-y-6">
              <Card className="lg:sticky lg:top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Pricing & inventory
                  </CardTitle>
                  <CardDescription>Core fields</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("price", { valueAsNumber: true, min: 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input {...register("currency")} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>In stock</Label>
                      <p className="text-xs text-muted-foreground">
                        If off → stock = 0
                      </p>
                    </div>
                    <Switch checked={inStock} onCheckedChange={setInStock} />
                  </div>

                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      step="1"
                      disabled={!inStock}
                      {...register("stock", { valueAsNumber: true, min: 0 })}
                    />
                  </div>

                  <Separator />

                  <div className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Preview</span>
                      <Badge variant="outline">
                        {String(currency || "TRY")}
                      </Badge>
                    </div>
                    <div className="mt-2 text-lg font-semibold">
                      {Number.isFinite(Number(price))
                        ? Number(price).toFixed(2)
                        : "0.00"}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        {String(currency || "TRY")}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Stock: {inStock ? Number(stock || 0) : 0}
                    </div>
                  </div>

                  {/* <div className="rounded-lg border overflow-hidden">
                    <div className="relative h-[220px] w-full bg-muted">
                      {mainImg ? (
                        <Image
                          fill
                          src={mainImg}
                          alt="preview"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                  </div> */}

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleSubmit(onSubmit)}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={submitting}
                      onClick={() => onOpenChange(false)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Close
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    PATCH:{" "}
                    <span className="font-mono">
                      {PRODUCTS_ENDPOINT}/{product.id}
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- main page (list + edit)
const ProductsAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);

  async function fetchProducts() {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch(
        `${PRODUCTS_ENDPOINT}?limit=100&offset=0&sortBy=created_at&sortDir=desc`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`,
        );
      }

      const data: ProductsListResponse = await res.json();
      const items: Product[] = Array.isArray(data)
        ? data
        : "items" in data
          ? data.items
          : [];
      setProducts(items);
    } catch (e: unknown) {
      const error = e as { message?: string } | null;
      setErr(error?.message || "Fetch error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const openEdit = (p: Product) => {
    setSelected(p);
    setEditOpen(true);
  };

  const onSaved = (next: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === next.id ? next : p)));
  };

  const onDelete = async (p: Product) => {
    const ok = window.confirm(
      `Delete product?\n\n${p.en_name} / ${p.tr_name} / ${p.ar_name}`,
    );
    if (!ok) return;

    try {
      const res = await fetch(`${PRODUCTS_ENDPOINT}/${p.id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(json?.message || `Delete failed (${res.status})`);

      toast.success("Deleted");
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e: unknown) {
      const error = e as { message?: string } | null;
      toast.error(error?.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container mx-auto py-12 space-y-2">
        <div className="text-destructive">Error: {err}</div>
        <Button variant="outline" onClick={fetchProducts}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Click <span className="font-medium">Edit</span> to update everything
            via PATCH.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchProducts}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => {
          const img = p.thumbnail || p.image || p.gallery?.[0] || "";
          const highlights = splitHighlights(p.en_highlights).slice(0, 2);

          return (
            <Card key={p.id} className="overflow-hidden">
              <div className="relative h-[220px] w-full bg-muted">
                {img ? (
                  <Image
                    fill
                    src={img}
                    alt={p.en_name}
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-base">{p.en_name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {p.tr_name} • {p.ar_name}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{p.currency}</Badge>
                  <Badge variant="outline">{p.price}</Badge>
                  <Badge variant={p.stock > 0 ? "default" : "destructive"}>
                    {p.stock > 0 ? `Stock: ${p.stock}` : "Out of stock"}
                  </Badge>
                </div>

                {highlights.length ? (
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {highlights.map((h, i) => (
                      <li key={i} className="whitespace-pre-line">
                        {h}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No highlights</p>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => openEdit(p)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" onClick={() => onDelete(p)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  ID: <span className="font-mono">{p.id}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <EditProductDialog
        open={editOpen}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
          setEditOpen(o);
        }}
        product={selected}
        onSaved={onSaved}
      />
    </div>
  );
};

export default ProductsAdmin;
