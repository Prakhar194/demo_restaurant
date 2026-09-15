"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = any;
type Category = any;
type Banner = any;

type Settings = {
  address: string;
  phone: string;
};

async function upload(file: File, kind: "items" | "banners") {
  const form = new FormData();

  form.append("file", file);
  form.append("kind", kind);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: form,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Upload failed");
  }

  return data.url as string;
}

export default function AdminClient({
  categories,
  items: initialItems,
  banners: initialBanners,
  settings: initialSettings,
}: {
  categories: Category[];
  items: Item[];
  banners: Banner[];
  settings?: Settings | null;
}) {
  const router = useRouter();

  const [items, setItems] = useState(initialItems);
  const [banners, setBanners] = useState(initialBanners);

  const [categoryList, setCategoryList] = useState(categories);

  const [saving, setSaving] = useState(false);
  const [uploadingItem, setUploadingItem] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const [settings, setSettings] = useState<Settings>(
    initialSettings ?? {
      address: "Rawata Mor Chowk, New Delhi - 110073",
      phone: "9625346361",
    }
  );

  const [savingSettings, setSavingSettings] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    category_id: categories[0]?.id || "",
    half_price: "",
    full_price: "",
    description: "",
    image_url: "",
  });

  const [banner, setBanner] = useState({
    title: "Half & Full",
    subtitle: "The Taste of Snacks....",
    image_url: "",
  });

  // =========================
  // ADD CATEGORY
  // =========================

  async function addCategory() {
    const name = newCategoryName.trim();

    if (!name) {
      alert("Enter category name.");
      return;
    }

    setAddingCategory(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add category");
      }

      setCategoryList((prev) => [...prev, data.category]);

      // If there was no category before, automatically select new category
      if (!newItem.category_id) {
        setNewItem((prev) => ({
          ...prev,
          category_id: data.category.id,
        }));
      }

      setNewCategoryName("");
    } catch (e: any) {
      alert(e.message || "Failed to add category");
    } finally {
      setAddingCategory(false);
    }
  }

  // =========================
  // DELETE CATEGORY
  // =========================

  async function deleteCategory(id: string) {
    const category = categoryList.find((c) => c.id === id);

    if (!category) return;

    const confirmed = confirm(
      `Delete category "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      const updatedCategories = categoryList.filter(
        (c) => c.id !== id
      );

      setCategoryList(updatedCategories);

      // If deleted category was selected in add item form
      if (newItem.category_id === id) {
        setNewItem((prev) => ({
          ...prev,
          category_id: updatedCategories[0]?.id || "",
        }));
      }
    } catch (e: any) {
      alert(e.message || "Failed to delete category");
    }
  }

  // =========================
  // SAVE RESTAURANT SETTINGS
  // =========================

  async function saveSettings() {
    if (!settings.address.trim()) {
      alert("Address is required.");
      return;
    }

    if (!settings.phone.trim()) {
      alert("Phone number is required.");
      return;
    }

    setSavingSettings(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: settings.address.trim(),
          phone: settings.phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to save restaurant information"
        );
      }

      setSettings(data.settings);

      alert("Restaurant information updated successfully.");
    } catch (e: any) {
      alert(
        e.message || "Failed to save restaurant information"
      );
    } finally {
      setSavingSettings(false);
    }
  }

  // =========================
  // ADD ITEM
  // =========================

  async function addItem() {
    if (!newItem.name.trim()) {
      alert("Enter item name.");
      return;
    }

    if (!newItem.category_id) {
      alert("Select a category.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/admin/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add item");
      }

      setItems((prev: Item[]) => [data, ...prev]);

      setNewItem({
        name: "",
        category_id: categoryList[0]?.id || "",
        half_price: "",
        full_price: "",
        description: "",
        image_url: "",
      });
    } catch (e: any) {
      alert(e.message || "Failed to add item");
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // UPDATE ITEM
  // =========================

  async function updateItem(item: Item, patch: any) {
    const next = {
      ...item,
      ...patch,
    };

    setItems((prev: Item[]) =>
      prev.map((x) =>
        x.id === item.id ? next : x
      )
    );

    try {
      const res = await fetch("/api/admin/items", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item.id,
          ...patch,
        }),
      });

      if (!res.ok) {
        alert("Update failed.");
        router.refresh();
      }
    } catch {
      alert("Update failed.");
      router.refresh();
    }
  }

  // =========================
  // DELETE ITEM
  // =========================

  async function deleteItem(id: string) {
    if (!confirm("Delete this item permanently?")) return;

    try {
      const res = await fetch("/api/admin/items", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setItems((prev: Item[]) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (e: any) {
      alert(e.message || "Delete failed");
    }
  }

  // =========================
  // ADD BANNER
  // =========================

  async function addBanner() {
    if (!banner.image_url) {
      alert("Choose a banner image first.");
      return;
    }

    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(banner),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to publish banner"
        );
      }

      setBanners((prev: Banner[]) => [data, ...prev]);

      setBanner({
        title: "",
        subtitle: "",
        image_url: "",
      });
    } catch (e: any) {
      alert(e.message || "Failed to publish banner");
    }
  }

  // =========================
  // DELETE BANNER
  // =========================

  async function deleteBanner(id: string) {
    if (!confirm("Delete this banner?")) return;

    try {
      const res = await fetch("/api/admin/banners", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setBanners((prev: Banner[]) =>
        prev.filter((b) => b.id !== id)
      );
    } catch (e: any) {
      alert(e.message || "Delete failed");
    }
  }

  // =========================
  // ITEM IMAGE UPLOAD
  // =========================

  async function handleItemImage(file: File) {
    setUploadingItem(true);

    try {
      const url = await upload(file, "items");

      setNewItem((prev) => ({
        ...prev,
        image_url: url,
      }));
    } catch (err: any) {
      console.error("Item upload error:", err);
      alert(
        err.message || "Item image upload failed"
      );
    } finally {
      setUploadingItem(false);
    }
  }

  // =========================
  // BANNER IMAGE UPLOAD
  // =========================

  async function handleBannerImage(file: File) {
    setUploadingBanner(true);

    try {
      console.log("Banner file selected:", file);

      const url = await upload(file, "banners");

      console.log(
        "Banner uploaded successfully:",
        url
      );

      setBanner((prev) => ({
        ...prev,
        image_url: url,
      }));
    } catch (err: any) {
      console.error("Banner upload error:", err);

      alert(
        err.message || "Banner image upload failed"
      );
    } finally {
      setUploadingBanner(false);
    }
  }

  // =========================
  // LOGOUT
  // =========================

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-30 bg-[#101113] px-4 py-4 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div>
            <p className="text-xs font-bold text-[#e5ad3a]">
              HALF & FULL
            </p>

            <h1 className="text-xl font-black">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex gap-2">

            <a
              href="/"
              className="rounded-lg bg-white/10 px-3 py-2 text-sm"
            >
              View site
            </a>

            <button
              onClick={logout}
              className="rounded-lg bg-red-500 px-3 py-2 text-sm font-bold"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <div className="mx-auto max-w-7xl space-y-7 p-4 md:p-7">

        {/* ================= RESTAURANT INFORMATION ================= */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="text-xl font-black">
            Restaurant Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            These details will appear on the customer website.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            {/* ADDRESS */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-bold">
                Restaurant Address
              </label>

              <textarea
                value={settings.address}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Enter restaurant address"
                className="w-full rounded-xl border p-3 outline-none focus:border-[#e5ad3a]"
              />

            </div>

            {/* PHONE */}

            <div>

              <label className="mb-2 block text-sm font-bold">
                Phone Number
              </label>

              <input
                type="text"
                value={settings.phone}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="Enter phone number"
                className="w-full rounded-xl border p-3 outline-none focus:border-[#e5ad3a]"
              />

            </div>

            {/* SAVE */}

            <div className="flex items-end">

              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="w-full rounded-xl bg-[#101113] px-5 py-3 font-bold text-white disabled:opacity-50"
              >
                {savingSettings
                  ? "Saving..."
                  : "Save Restaurant Information"}
              </button>

            </div>

          </div>

        </section>

        {/* ================= CATEGORIES ================= */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="text-xl font-black">
            Manage Categories
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add or remove categories from your menu.
          </p>

          {/* ADD CATEGORY */}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">

            <input
              value={newCategoryName}
              onChange={(e) =>
                setNewCategoryName(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addCategory();
                }
              }}
              placeholder="Enter category name"
              className="flex-1 rounded-xl border p-3 outline-none focus:border-[#e5ad3a]"
            />

            <button
              onClick={addCategory}
              disabled={addingCategory}
              className="rounded-xl bg-[#e5ad3a] px-5 py-3 font-bold text-black disabled:opacity-50"
            >
              {addingCategory
                ? "Adding..."
                : "Add Category"}
            </button>

          </div>

          {/* CATEGORY LIST */}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {categoryList.map((category) => (

              <div
                key={category.id}
                className="flex items-center justify-between rounded-xl border bg-gray-50 p-3"
              >

                <span className="font-semibold">
                  {category.name}
                </span>

                <button
                  onClick={() =>
                    deleteCategory(category.id)
                  }
                  className="rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-200"
                >
                  Delete
                </button>

              </div>

            ))}

          </div>

        </section>

        {/* ================= ADD MENU ITEM ================= */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="text-xl font-black">
            Add menu item
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">

            <input
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  name: e.target.value,
                })
              }
              className="rounded-xl border p-3"
            />

            {/* CATEGORY */}

            <select
              value={newItem.category_id}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  category_id: e.target.value,
                })
              }
              className="rounded-xl border p-3"
            >
              {categoryList.length === 0 ? (
                <option value="">
                  No categories available
                </option>
              ) : (
                categoryList.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.name}
                  </option>
                ))
              )}
            </select>

            <input
              placeholder="Half price"
              type="number"
              value={newItem.half_price}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  half_price: e.target.value,
                })
              }
              className="rounded-xl border p-3"
            />

            <input
              placeholder="Full price"
              type="number"
              value={newItem.full_price}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  full_price: e.target.value,
                })
              }
              className="rounded-xl border p-3"
            />

            <input
              placeholder="Description (optional)"
              value={newItem.description}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  description: e.target.value,
                })
              }
              className="rounded-xl border p-3 lg:col-span-2"
            />

            {/* ITEM IMAGE */}

            <label className="cursor-pointer rounded-xl border border-dashed p-3 text-sm">

              {uploadingItem
                ? "Uploading item image..."
                : newItem.image_url
                ? "Item image selected ✓"
                : "Choose item image"}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingItem}
                onChange={async (e) => {

                  const file =
                    e.target.files?.[0];

                  if (!file) return;

                  await handleItemImage(file);

                  e.target.value = "";

                }}
              />

            </label>

          </div>

          {newItem.image_url && (
            <div className="mt-4">

              <img
                src={newItem.image_url}
                alt="Item preview"
                className="h-32 w-32 rounded-xl object-cover"
              />

            </div>
          )}

          <button
            disabled={
              saving ||
              !newItem.category_id
            }
            onClick={addItem}
            className="mt-4 rounded-xl bg-[#101113] px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Add item"}
          </button>

        </section>

        {/* ================= HERO BANNERS ================= */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="text-xl font-black">
            Hero banners
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">

            {/* TITLE */}

            <input
              placeholder="Banner title"
              value={banner.title}
              onChange={(e) =>
                setBanner({
                  ...banner,
                  title: e.target.value,
                })
              }
              className="rounded-xl border p-3"
            />

            {/* SUBTITLE */}

            <input
              placeholder="Banner subtitle"
              value={banner.subtitle}
              onChange={(e) =>
                setBanner({
                  ...banner,
                  subtitle: e.target.value,
                })
              }
              className="rounded-xl border p-3"
            />

            {/* BANNER IMAGE */}

            <label className="block cursor-pointer rounded-xl border border-dashed p-4 text-sm hover:bg-gray-50">

              <div className="font-bold">
                {uploadingBanner
                  ? "Uploading banner..."
                  : banner.image_url
                  ? "Banner image selected ✓"
                  : "Choose banner image"}
              </div>

              <div className="mt-1 text-xs text-gray-500">
                JPG, PNG, WEBP etc.
              </div>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingBanner}
                onChange={async (e) => {

                  const file =
                    e.target.files?.[0];

                  if (!file) return;

                  await handleBannerImage(file);

                  e.target.value = "";

                }}
              />

            </label>

            {/* PUBLISH */}

            <button
              onClick={addBanner}
              disabled={
                uploadingBanner ||
                !banner.image_url
              }
              className="rounded-xl bg-[#e5ad3a] px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadingBanner
                ? "Uploading..."
                : "Publish banner"}
            </button>

            {/* PREVIEW */}

            {banner.image_url && (
              <div className="md:col-span-2">

                <p className="mb-2 text-sm font-bold">
                  Banner preview
                </p>

                <img
                  src={banner.image_url}
                  alt="Banner preview"
                  className="h-48 w-full rounded-xl object-cover"
                />

              </div>
            )}

          </div>

          {/* EXISTING BANNERS */}

          <div className="mt-5 grid gap-3 md:grid-cols-3">

            {banners.map((b: Banner) => (

              <div
                key={b.id}
                className="rounded-xl border p-3"
              >

                <img
                  src={b.image_url}
                  alt={b.title || "Banner"}
                  className="h-32 w-full rounded-lg object-cover"
                />

                <p className="mt-2 font-bold">
                  {b.title}
                </p>

                {b.subtitle && (
                  <p className="mt-1 text-sm text-gray-500">
                    {b.subtitle}
                  </p>
                )}

                <button
                  onClick={() =>
                    deleteBanner(b.id)
                  }
                  className="mt-2 text-sm font-bold text-red-600"
                >
                  Delete
                </button>

              </div>

            ))}

          </div>

        </section>

        {/* ================= MENU ITEMS ================= */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="text-xl font-black">
            Menu items
          </h2>

          <div className="mt-4 space-y-3">

            {items.map((item: Item) => (

              <div
                key={item.id}
                className="grid gap-3 rounded-xl border p-3 md:grid-cols-[80px_1fr_110px_110px_90px] md:items-center"
              >

                <div className="h-16 w-20 overflow-hidden rounded-lg bg-gray-100">

                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  )}

                </div>

                <div>

                  <p className="font-extrabold">
                    {item.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {item.categories?.name}
                  </p>

                </div>

                <input
                  type="number"
                  value={item.half_price ?? ""}
                  onChange={(e) =>
                    updateItem(item, {
                      half_price:
                        e.target.value === ""
                          ? null
                          : Number(e.target.value),
                    })
                  }
                  placeholder="Half"
                  className="rounded-lg border p-2"
                />

                <input
                  type="number"
                  value={item.full_price ?? ""}
                  onChange={(e) =>
                    updateItem(item, {
                      full_price:
                        e.target.value === ""
                          ? null
                          : Number(e.target.value),
                    })
                  }
                  placeholder="Full"
                  className="rounded-lg border p-2"
                />

                <button
                  onClick={() =>
                    deleteItem(item.id)
                  }
                  className="rounded-lg bg-red-50 px-3 py-2 font-bold text-red-600"
                >
                  Delete
                </button>

              </div>

            ))}

          </div>

        </section>

      </div>

    </main>
  );
}