 "use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, SlidersHorizontal, Phone, MapPin, X } from "lucide-react";

type Item = {
  id: string; name: string; category_id: string; description?: string | null;
  half_price?: number | null; full_price?: number | null; image_url?: string | null;
  categories?: { name: string };
};
type Category = { id: string; name: string; sort_order: number };
type Banner = { id: string; title?: string | null; subtitle?: string | null; image_url: string };

export default function MenuClient({ categories, items, banners }: {
  categories: Category[]; items: Item[]; banners: Banner[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");

  const filtered = useMemo(() => {
    const list = items.filter(i =>
      (category === "all" || i.category_id === category) &&
      i.name.toLowerCase().includes(query.toLowerCase())
    );
    return [...list].sort((a,b) => {
      if (sort === "price-low") return Number(a.half_price ?? a.full_price ?? 0) - Number(b.half_price ?? b.full_price ?? 0);
      if (sort === "price-high") return Number(b.half_price ?? b.full_price ?? 0) - Number(a.half_price ?? a.full_price ?? 0);
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [items, category, query, sort]);

  const banner = banners[0];

  return (
    <main>
      <header className="sticky top-0 z-30 border-b bg-[#101113]/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <a href="#" className="text-2xl font-black text-[#e5ad3a]">Half & Full</a>
          <a href="tel:9625346361" className="flex items-center gap-2 rounded-full bg-[#e5ad3a] px-4 py-2 text-sm font-bold text-black">
            <Phone size={16}/> Call
          </a>
        </div>
      </header>

      <section className="relative min-h-[300px] overflow-hidden bg-[#101113] md:min-h-[420px]">
        {banner ? (
          <Image src={banner.image_url} alt={banner.title || "Restaurant banner"} fill priority className="object-cover opacity-80" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3b3525,transparent_60%)]" />
        )}
        <div className="relative z-10 mx-auto flex min-h-[300px] max-w-7xl items-center px-5 py-16 md:min-h-[420px]">
          <div className="max-w-2xl text-white">
            <p className="mb-3 inline-block rounded-full bg-[#e5ad3a] px-3 py-1 text-xs font-bold uppercase tracking-wider text-black">Fresh • Fast • Delicious</p>
            <h1 className="text-5xl font-black leading-none md:text-7xl">{banner?.title || "Half & Full"}</h1>
            <p className="mt-4 text-xl text-white/85 md:text-2xl">{banner?.subtitle || "The Taste of Snacks...."}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-white/75"><MapPin size={16}/> Add: Rawata Mor Chowk, New Delhi - 110073</p>
          </div>
        </div>
      </section>

      <section className="sticky top-[65px] z-20 border-b bg-white/95 px-4 py-4 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={19}/>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search momos, chowmein, rice..." className="w-full rounded-xl border px-10 py-3 outline-none focus:border-[#e5ad3a]"/>
          </div>
          <div className="flex gap-2">
            <select value={sort} onChange={e=>setSort(e.target.value)} className="rounded-xl border bg-white px-3 py-3">
              <option value="default">Sort: Recommended</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name">Name A → Z</option>
            </select>
            <SlidersHorizontal className="mt-3 hidden md:block" size={20}/>
          </div>
        </div>
        <div className="mx-auto mt-3 flex max-w-7xl gap-2 overflow-x-auto pb-1">
          <button onClick={()=>setCategory("all")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${category==="all"?"bg-[#101113] text-white":"bg-gray-100"}`}>All</button>
          {categories.map(c=><button key={c.id} onClick={()=>setCategory(c.id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${category===c.id?"bg-[#101113] text-white":"bg-gray-100"}`}>{c.name}</button>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-5 flex items-end justify-between">
          <div><p className="text-sm font-bold uppercase tracking-widest text-[#b17b18]">Our Menu</p><h2 className="text-3xl font-black">Choose your favourite</h2></div>
          <span className="text-sm text-gray-500">{filtered.length} items</span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">No items found.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(item => (
              <article key={item.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-48 bg-gray-100">
                  {item.image_url ? <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw"/> : <div className="flex h-full items-center justify-center text-gray-400">No image</div>}
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#b17b18]">{item.categories?.name}</p>
                  <h3 className="mt-1 text-lg font-extrabold">{item.name}</h3>
                  {item.description && <p className="mt-1 text-sm text-gray-500">{item.description}</p>}
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="flex gap-3 text-sm font-bold">
                      {item.half_price != null && <span>Half ₹{item.half_price}</span>}
                      {item.full_price != null && <span>Full ₹{item.full_price}</span>}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="bg-[#101113] px-5 py-10 text-center text-white">
        <h3 className="text-2xl font-black text-[#e5ad3a]">Half & Full</h3>
        <p className="mt-2 text-white/70">The Taste of Snacks....</p>
        <p className="mt-4 flex justify-center gap-2 text-sm text-white/70"><MapPin size={16}/> Rawata Mor Chowk, New Delhi - 110073</p>
      </footer>
    </main>
  );
}
