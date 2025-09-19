import { useEffect, useMemo, useState } from "react";
/* import CategorySelects from "../components/CategorySelects"; */
import SearchBar from "../searchBar/SearchBar";
/* import ProductRow from "../components/ProductRow"; */
/* import { fetchJSON, postJSON } from "../lib/api"; */
import ClientPicker from "../clientPicker/ClientPicker";

const NewMarketCheck = ({ sellerId }) => {
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [categoryId, setCategoryId] = useState(null); // categoría grande
  const [subcategoryId, setSubcategoryId] = useState(null); // subcategoría
  const [q, setQ] = useState("");
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState({}); // productId -> { price_amount, currency_code, fx_rate_used, photo_url }

  const canLoadProducts = useMemo(
    () => Boolean(subcategoryId),
    [subcategoryId]
  );

  
  const setLine = (productId, v) => {
    setLines((prev) => ({ ...prev, [productId]: v }));
  };

/*   const handleSubmit = async () => {
    if (!sellerId) return alert("Falta sellerId");
    if (!selectedClientId) return alert("Selecciona un establecimiento");
    if (!subcategoryId) return alert("Selecciona una subcategoría");

    // Construimos payload
    const payload = {
      seller_id: sellerId,
      establishment_id: selectedClientId,
      visited_at: new Date().toISOString(),
      notes: "",
      lines: Object.entries(lines)
        .filter(([, v]) => v && Number(v.price_amount) > 0)
        .map(([productId, v]) => ({
          competitor_product_id: Number(productId),
          currency_code: v.currency_code || "USD",
          fx_rate_used:
            v.currency_code === "VES" ? Number(v.fx_rate_used || 0) : null,
          price_amount: Number(v.price_amount),
          photo_url: v.photo_url || null,
          shelf_info: null,
        })),
    };

    if (!payload.lines.length) return alert("Agrega al menos un precio.");

    try {
      const res = await postJSON("/api/market-surveys", payload);
      alert(`Check guardado. ID: ${res?.survey_id || "?"}`);
      setLines({});
    } catch (e) {
      alert(`Error al guardar: ${e.message}`);
    }
  }; */

  return (
    <div className="max-w-6xl mx-auto p-4 grid gap-4">
      <h1 className="text-2xl font-semibold">Estudio de Precios — Nuevo</h1>

      {/* Establecimiento */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Establecimiento</label>
        <ClientPicker value={selectedClientId} onChange={setSelectedClientId} />
      </div>

      {/* Categoría y Subcategoría */}
      <div className="grid gap-2">
        <label className="text-sm font-medium">Categoría / Subcategoría</label>
        {/*  <CategorySelects
          categoryId={categoryId}
          onCategoryChange={(id) => {
            setCategoryId(id);
            setSubcategoryId(null);
          }}
          subcategoryId={subcategoryId}
          onSubcategoryChange={setSubcategoryId}
        /*/}
      </div>

      {/* Búsqueda */}
      <SearchBar
        placeholder="Buscar producto de la subcategoría…"
        onChange={setQ}
      />

      {/* Lista de productos */}
      <div className="border rounded">
        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 border-b text-sm font-medium">
          <div className="col-span-5">Producto</div>
          <div className="col-span-2">Moneda</div>
          <div className="col-span-2">Precio</div>
          <div className="col-span-2">Tasa (si Bs)</div>
          <div className="col-span-1 text-right">Foto</div>
        </div>
        {/* 
        {products.length === 0 ? (
          <div className="px-3 py-6 text-gray-500">
            No hay productos para la subcategoría seleccionada.
          </div>
        ) : (
          products.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              value={lines[p.id]}
              onChange={(v) => setLine(p.id, v)}
            />
          ))
        )} */}
      </div>

      <div className="flex justify-end">
        <button
          onClick={()=>{}}
          className="px-4 py-2 rounded bg-emerald-600 text-white"
        >
          Guardar precios
        </button>
      </div>
    </div>
  );
};

export default NewMarketCheck;
