 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = any; type Category = any; type Banner = any;

async function upload(file: File, kind: "items"|"banners") {
  const form = new FormData(); form.append("file", file); form.append("kind", kind);
  const res = await fetch("/api/admin/upload", {method:"POST", body:form});
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

export default function AdminClient({ categories, items: initialItems, banners: initialBanners }: {
  categories: Category[]; items: Item[]; banners: Banner[];
}) {
  const router = useRouter();
  const [items,setItems] = useState(initialItems);
  const [banners,setBanners] = useState(initialBanners);
  const [saving,setSaving] = useState(false);
  const [newItem,setNewItem] = useState({name:"",category_id:categories[0]?.id||"",half_price:"",full_price:"",description:"",image_url:""});
  const [banner,setBanner] = useState({title:"Half & Full",subtitle:"The Taste of Snacks....",image_url:""});

  async function addItem() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/items",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newItem)});
      const data=await res.json(); if(!res.ok) throw new Error(data.error);
      setItems([data,...items]); setNewItem({name:"",category_id:categories[0]?.id||"",half_price:"",full_price:"",description:"",image_url:""});
    } catch(e:any){ alert(e.message); } finally { setSaving(false); }
  }

  async function updateItem(item: Item, patch: any) {
    const next={...item,...patch};
    setItems(items.map(x=>x.id===item.id?next:x));
    const res=await fetch("/api/admin/items",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:item.id,...patch})});
    if(!res.ok){alert("Update failed"); router.refresh();}
  }

  async function deleteItem(id:string) {
    if(!confirm("Delete this item permanently?")) return;
    await fetch("/api/admin/items",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    setItems(items.filter(x=>x.id!==id));
  }

  async function addBanner() {
    if(!banner.image_url) return alert("Choose a banner image first.");
    const res=await fetch("/api/admin/banners",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(banner)});
    const data=await res.json(); if(!res.ok) return alert(data.error);
    setBanners([data,...banners]); setBanner({title:"",subtitle:"",image_url:""});
  }

  async function deleteBanner(id:string) {
    if(!confirm("Delete this banner?")) return;
    await fetch("/api/admin/banners",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    setBanners(banners.filter(x=>x.id!==id));
  }

  async function logout() {
    await fetch("/api/admin/logout",{method:"POST"}); router.push("/admin/login"); router.refresh();
  }

  return <main className="min-h-screen bg-gray-100">
    <header className="sticky top-0 z-30 bg-[#101113] px-4 py-4 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div><p className="text-xs font-bold text-[#e5ad3a]">HALF & FULL</p><h1 className="text-xl font-black">Admin Dashboard</h1></div>
        <div className="flex gap-2"><a href="/" className="rounded-lg bg-white/10 px-3 py-2 text-sm">View site</a><button onClick={logout} className="rounded-lg bg-red-500 px-3 py-2 text-sm font-bold">Logout</button></div>
      </div>
    </header>

    <div className="mx-auto max-w-7xl space-y-7 p-4 md:p-7">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Add menu item</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <input placeholder="Item name" value={newItem.name} onChange={e=>setNewItem({...newItem,name:e.target.value})} className="rounded-xl border p-3"/>
          <select value={newItem.category_id} onChange={e=>setNewItem({...newItem,category_id:e.target.value})} className="rounded-xl border p-3">{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <input placeholder="Half price" type="number" value={newItem.half_price} onChange={e=>setNewItem({...newItem,half_price:e.target.value})} className="rounded-xl border p-3"/>
          <input placeholder="Full price" type="number" value={newItem.full_price} onChange={e=>setNewItem({...newItem,full_price:e.target.value})} className="rounded-xl border p-3"/>
          <input placeholder="Description (optional)" value={newItem.description} onChange={e=>setNewItem({...newItem,description:e.target.value})} className="rounded-xl border p-3 lg:col-span-2"/>
          <label className="cursor-pointer rounded-xl border border-dashed p-3 text-sm">Item image: {newItem.image_url?"Selected":"Choose image"}<input type="file" accept="image/*" className="hidden" onChange={async e=>{const f=e.target.files?.[0];if(f){try{setNewItem({...newItem,image_url:await upload(f,"items")})}catch(err:any){alert(err.message)}}}}/></label>
        </div>
        <button disabled={saving} onClick={addItem} className="mt-4 rounded-xl bg-[#101113] px-5 py-3 font-bold text-white">{saving?"Saving...":"Add item"}</button>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Hero banners</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input placeholder="Banner title" value={banner.title} onChange={e=>setBanner({...banner,title:e.target.value})} className="rounded-xl border p-3"/>
          <input placeholder="Banner subtitle" value={banner.subtitle} onChange={e=>setBanner({...banner,subtitle:e.target.value})} className="rounded-xl border p-3"/>
          <label className="cursor-pointer rounded-xl border border-dashed p-3 text-sm">Choose banner image<input type="file" accept="image/*" className="hidden" onChange={async e=>{const f=e.target.files?.[0];if(f){try{setBanner({...banner,image_url:await upload(f,"banners")})}catch(err:any){alert(err.message)}}}}/></label>
          <button onClick={addBanner} className="rounded-xl bg-[#e5ad3a] px-5 py-3 font-bold">Publish banner</button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">{banners.map(b=><div key={b.id} className="rounded-xl border p-3"><img src={b.image_url} className="h-32 w-full rounded-lg object-cover"/><p className="mt-2 font-bold">{b.title}</p><button onClick={()=>deleteBanner(b.id)} className="mt-2 text-sm font-bold text-red-600">Delete</button></div>)}</div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Menu items</h2>
        <div className="mt-4 space-y-3">
          {items.map(item=><div key={item.id} className="grid gap-3 rounded-xl border p-3 md:grid-cols-[80px_1fr_110px_110px_90px] md:items-center">
            <div className="h-16 w-20 overflow-hidden rounded-lg bg-gray-100">{item.image_url&&<img src={item.image_url} className="h-full w-full object-cover"/>}</div>
            <div><p className="font-extrabold">{item.name}</p><p className="text-xs text-gray-500">{item.categories?.name}</p></div>
            <input type="number" value={item.half_price ?? ""} onChange={e=>updateItem(item,{half_price:e.target.value===""?null:Number(e.target.value)})} placeholder="Half" className="rounded-lg border p-2"/>
            <input type="number" value={item.full_price ?? ""} onChange={e=>updateItem(item,{full_price:e.target.value===""?null:Number(e.target.value)})} placeholder="Full" className="rounded-lg border p-2"/>
            <button onClick={()=>deleteItem(item.id)} className="rounded-lg bg-red-50 px-3 py-2 font-bold text-red-600">Delete</button>
          </div>)}
        </div>
      </section>
    </div>
  </main>;
}
