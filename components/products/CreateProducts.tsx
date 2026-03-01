"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Loader2,
  Link as LinkIcon,
  Package,
  Languages,
  Image as ImageIcon,
} from "lucide-react";
import { API_BASE_URL } from "@/context/api";

type ProductPayload = {
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

const ENDPOINT = `${API_BASE_URL}/api/products`;

// helpers
const isLikelyUrl = (s: string) => {
  if (!s) return true; // empty allowed
  try {
    // allow relative paths like /images/...
    if (s.startsWith("/")) return true;
    new URL(s);
    return true;
  } catch {
    return false;
  }
};

const sanitizeGallery = (items: string[]) =>
  items.map((x) => (x ?? "").trim()).filter(Boolean);

const prettyError = (err: unknown) => {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err)
    return String((err as Record<string, unknown>).message);
  return "Request failed";
};

const CreateProducts = () => {
  const [submitting, setSubmitting] = useState(false);
  const [gallery, setGallery] = useState<string[]>([
    "/images/products/cares/lapace2913.jpg",
    "/images/products/cares/lapace2718.jpg",
    "/images/products/cares/lapace2878.jpg",
    "/images/img/lapace2355.jpg",
  ]);

  const [inStock, setInStock] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProductPayload>({
    defaultValues: {
      en_name: "",
      ar_name: "",
      tr_name: "",

      en_description: "",
      ar_description: "",
      tr_description: "",

      en_highlights: "",
      ar_highlights: "",
      tr_highlights: "",

      en_usage: "",
      ar_usage: "",
      tr_usage: "",

      price: 549,
      currency: "TRY",
      thumbnail: "/images/img/lapace2355.jpg",
      image: "/img/caress_copy.jpg",
      stock: 12,
      gallery: [],
    },
    mode: "onChange",
  });

  // sync stock switch with stock value
  const stockValue = watch("stock");
  const currencyValue = watch("currency");
  const thumbnailValue = watch("thumbnail");
  const imageValue = watch("image");

  const urlWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (!isLikelyUrl(thumbnailValue || ""))
      warnings.push("Thumbnail URL looks invalid.");
    if (!isLikelyUrl(imageValue || ""))
      warnings.push("Main image URL looks invalid.");
    const badGallery = gallery.filter((g) => !isLikelyUrl(g));
    if (badGallery.length)
      warnings.push(`Some gallery URLs look invalid (${badGallery.length}).`);
    return warnings;
  }, [thumbnailValue, imageValue, gallery]);

  const onSubmit = async (data: ProductPayload) => {
    try {
      setSubmitting(true);

      const cleanedGallery = sanitizeGallery(gallery);

      const payload: ProductPayload = {
        ...data,
        // keep DB clean: empty strings => null
        en_description: data.en_description?.trim() || null,
        ar_description: data.ar_description?.trim() || null,
        tr_description: data.tr_description?.trim() || null,

        en_highlights: data.en_highlights?.trim() || null,
        ar_highlights: data.ar_highlights?.trim() || null,
        tr_highlights: data.tr_highlights?.trim() || null,

        en_usage: data.en_usage?.trim() || null,
        ar_usage: data.ar_usage?.trim() || null,
        tr_usage: data.tr_usage?.trim() || null,

        thumbnail: data.thumbnail?.trim() || null,
        image: data.image?.trim() || null,

        // if out of stock switch is off, force 0
        stock: inStock ? Number(data.stock || 0) : 0,
        gallery: cleanedGallery,
        price: Number(data.price),
        currency: String(data.currency || "TRY"),
      };

      // basic guardrails
      if (!payload.en_name || !payload.ar_name || !payload.tr_name) {
        toast.error("Please fill product name in EN / AR / TR.");
        return;
      }
      if (!Number.isFinite(payload.price) || payload.price < 0) {
        toast.error("Price must be a valid non-negative number.");
        return;
      }
      if (!Number.isFinite(payload.stock) || payload.stock < 0) {
        toast.error("Stock must be a valid non-negative number.");
        return;
      }

      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = json?.message || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      toast.success("Product created");
      // keep form values but reset gallery to the saved (optional)
      // reset({ ...data, stock: payload.stock, currency: payload.currency });
      // Or clear:
      // reset();
      // setGallery([]);
      // setInStock(true);

      // if you want: show returned product
      // console.log(json);
    } catch (err) {
      console.error(err);
      toast.error(prettyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const addGalleryRow = () => setGallery((prev) => [...prev, ""]);
  const removeGalleryRow = (idx: number) =>
    setGallery((prev) => prev.filter((_, i) => i !== idx));
  const updateGalleryRow = (idx: number, val: string) =>
    setGallery((prev) => prev.map((x, i) => (i === idx ? val : x)));

  const quickFillCommon = () => {
    // You can keep common highlights/usage consistent for all products
    // (feel free to edit these defaults later)
    toast.message("Filled with common content (you can edit).");
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <h1 className="text-2xl font-semibold">Create product</h1>
            <Badge variant="secondary" className="ml-2">
              {API_BASE_URL.replace("https://", "")}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => quickFillCommon()}
          >
            Use common text
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={submitting}
            className="min-w-[160px]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
              </>
            ) : (
              "Create product"
            )}
          </Button>
        </div>
      </div>

      {urlWarnings.length > 0 && (
        <Alert className="mb-6">
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
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT: main */}
        <div className="space-y-6">
          {/* Titles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Titles (EN / TR / AR)
              </CardTitle>
              <CardDescription>These are required.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>English name</Label>
                  <Input
                    placeholder="e.g. Caress Moisturizing Stick"
                    {...register("en_name", { required: "Required" })}
                  />
                  {errors.en_name && (
                    <p className="text-xs text-destructive">
                      {String(errors.en_name.message)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Türkçe isim</Label>
                  <Input
                    placeholder="e.g. Caress Nemlendirici Stick"
                    {...register("tr_name", { required: "Required" })}
                  />
                  {errors.tr_name && (
                    <p className="text-xs text-destructive">
                      {String(errors.tr_name.message)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>الاسم بالعربية</Label>
                  <Input
                    dir="rtl"
                    placeholder="مثال: عصا كيريس المرطبة"
                    {...register("ar_name", { required: "Required" })}
                  />
                  {errors.ar_name && (
                    <p className="text-xs text-destructive">
                      {String(errors.ar_name.message)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>
                Description, highlights, usage — keep formatting with new lines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="tr">Türkçe</TabsTrigger>
                  <TabsTrigger value="ar">العربية</TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-4">
                  <div className="space-y-2">
                    <Label>EN description</Label>
                    <Textarea rows={6} {...register("en_description")} />
                  </div>
                  <div className="space-y-2">
                    <Label>EN highlights</Label>
                    <Textarea rows={7} {...register("en_highlights")} />
                    <p className="text-xs text-muted-foreground">
                      Tip: use blank lines between items for readability.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>EN usage</Label>
                    <Textarea rows={7} {...register("en_usage")} />
                  </div>
                </TabsContent>

                <TabsContent value="tr" className="space-y-4">
                  <div className="space-y-2">
                    <Label>TR description</Label>
                    <Textarea rows={6} {...register("tr_description")} />
                  </div>
                  <div className="space-y-2">
                    <Label>TR highlights</Label>
                    <Textarea rows={7} {...register("tr_highlights")} />
                  </div>
                  <div className="space-y-2">
                    <Label>TR usage</Label>
                    <Textarea rows={7} {...register("tr_usage")} />
                  </div>
                </TabsContent>

                <TabsContent value="ar" className="space-y-4">
                  <div className="space-y-2">
                    <Label>AR description</Label>
                    <Textarea
                      dir="rtl"
                      rows={6}
                      {...register("ar_description")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>AR highlights</Label>
                    <Textarea
                      dir="rtl"
                      rows={7}
                      {...register("ar_highlights")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>AR usage</Label>
                    <Textarea dir="rtl" rows={7} {...register("ar_usage")} />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Media URLs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Media (URLs)
              </CardTitle>
              <CardDescription>
                Paste URLs or relative paths. No file upload here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Input
                    placeholder="/images/img/example.jpg"
                    {...register("thumbnail")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in product list cards.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Main image URL</Label>
                  <Input
                    placeholder="/img/product_main.jpg"
                    {...register("image")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in product page hero.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Gallery URLs</Label>
                    <p className="text-xs text-muted-foreground">
                      Add multiple images for the gallery slider.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addGalleryRow}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add image
                  </Button>
                </div>

                <div className="space-y-2">
                  {gallery.length === 0 ? (
                    <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                      No gallery images yet. Click “Add image”.
                    </div>
                  ) : (
                    gallery.map((g, idx) => (
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
                          className="shrink-0"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: sidebar */}
        <div className="space-y-6">
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle>Pricing & inventory</CardTitle>
              <CardDescription>Core commerce fields.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("price", {
                      required: "Required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be >= 0" },
                    })}
                  />
                  {errors.price && (
                    <p className="text-xs text-destructive">
                      {String(errors.price.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    placeholder="TRY"
                    {...register("currency", { required: "Required" })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: TRY, USD, EUR (your DB default is TRY).
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>In stock</Label>
                  <p className="text-xs text-muted-foreground">
                    If off, stock will be set to 0.
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
                  {...register("stock", {
                    valueAsNumber: true,
                    min: { value: 0, message: "Must be >= 0" },
                  })}
                />
                {errors.stock && (
                  <p className="text-xs text-destructive">
                    {String(errors.stock.message)}
                  </p>
                )}
              </div>

              <Separator />

              <div className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Preview</span>
                  <Badge variant="outline">{currencyValue || "TRY"}</Badge>
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {Number.isFinite(Number(watch("price")))
                    ? Number(watch("price")).toFixed(2)
                    : "0.00"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {currencyValue || "TRY"}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Stock: {inStock ? stockValue || 0 : 0}
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
                  </>
                ) : (
                  "Create product"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={submitting}
                onClick={() => {
                  reset();
                  setGallery([]);
                  setInStock(true);
                  toast.message("Form cleared");
                }}
              >
                Clear form
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-10 rounded-lg border p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Backend expects:</p>
        <p className="mt-1">
          POST <span className="font-mono">{ENDPOINT}</span> with fields
          matching your DB columns (en/ar/tr names + descriptions + highlights +
          usage + price/currency + images + stock + gallery[]).
        </p>
      </div>
    </div>
  );
};

export default CreateProducts;
