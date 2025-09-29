import React, { useEffect, useMemo, useState, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import SearchBar from "../../features/searchBar/SearchBar";
import ClientPicker from "../../features/clientPicker/ClientPicker";
import CategoryPicker from "../../features/categoryPicker/CategoryPicker";
import { getMarketProductsByCat } from "../../features/slices/marketProductsSlice";
import MarketProductRow from "../../features/marketProductRow/MarketProductRow";
import {
  submitMarketCheck,
  clearSubmitState,
} from "../../features/slices/marketCheckSlice";
import { AuthContext } from "../../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const NewMarketCheckPage = () => {
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { marketProducts } = useSelector((state) => state.marketProducts);

  const [bcvRate, setBcvRate] = useState(0);
  const [currency, setCurrency] = useState("USD"); // GLOBAL: "USD" | "VES"
  const [fxRate, setFxRate] = useState(""); // GLOBAL: solo si currency === "VES"

  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedCatId, setSelectedCatId] = useState(null); // subcategoría seleccionada
  const [q, setQ] = useState("");
  const [lines, setLines] = useState({}); // { [productId]: { price } }

  // Cargar tasa (paralelo/BCV) al montar
  useEffect(() => {
    const fetchBcvRate = async () => {
      try {
        const resp = await axios.get(
          "https://ve.dolarapi.com/v1/dolares/oficial"
        );
        // Si tu API te da «promedio», úsalo como default
        const rate = Number(resp?.data?.promedio || 0);
        if (rate > 0) {
          setBcvRate(rate);
          setFxRate(String(rate)); // por defecto precargar la tasa global
        }
      } catch (err) {
        console.error("Error fetching FX rate:", err);
      }
    };
    fetchBcvRate();
  }, []);

  // Cargar productos por subcategoría
  useEffect(() => {
    if (selectedCatId) {
      dispatch(getMarketProductsByCat({ categoryId: selectedCatId }));
    }
  }, [selectedCatId, dispatch]);

  // Limpiar estado de submit al montar/desmontar
  useEffect(() => {
    return () => dispatch(clearSubmitState());
  }, [dispatch]);

  const setLine = (productId, v) => {
    setLines((prev) => ({
      ...prev,
      [productId]: v,
    }));
  };

  const filteredProducts = useMemo(() => {
    const term = (q || "").trim().toLowerCase();
    if (!term) return marketProducts;
    return marketProducts.filter((p) =>
      [p.name, p.presentation, p.brand_name]
        .filter(Boolean)
        .some((t) => String(t).toLowerCase().includes(term))
    );
  }, [q, marketProducts]);

  const canSubmit = useMemo(() => {
    if (currency === "VES" && (!fxRate || Number(fxRate) <= 0)) return false;
    const hasAny = Object.values(lines).some((v) => Number(v?.price) > 0);
    return !!user && !!selectedClientId && !!selectedCatId && hasAny;
  }, [currency, fxRate, lines, user, selectedClientId, selectedCatId]);

  const handleSubmit = async () => {
    if (!user) return alert("Falta sellerId");
    if (!selectedClientId) return alert("Selecciona un establecimiento");
    if (!selectedCatId) return alert("Selecciona una categoría");
    if (currency === "VES" && (!fxRate || Number(fxRate) <= 0)) {
      return alert("Indica una tasa válida para Bs.");
    }

    const rate = Number(fxRate);
    const linesArray = Object.entries(lines)
      .filter(([, v]) => v && Number(v.price) > 0)
      .map(([productId, v]) => {
        const raw = Number(v.price);
        const price_usd =
          currency === "VES" ? +(raw / rate).toFixed(2) : +raw.toFixed(2);

        return {
          market_product_id: Number(productId),
          currency_code: "USD", // siempre enviamos USD
          price_usd,
          fx_rate_used: currency === "VES" ? rate : null, // referencia de conversión
        };
      });

    if (!linesArray.length) return alert("Agrega al menos un precio válido.");

    const payload = {
      seller_id: user.id,
      client_id: selectedClientId,
      visited_at: new Date().toISOString(),
      notes: "",
      lines: linesArray,
    };

    await dispatch(submitMarketCheck(payload));
    setSelectedCatId(null);
    setSelectedClientId(null);
    setLines({});
    setQ("");
    navigate("/market-check-confirmation");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 grid gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Estudio de Precios</h1>
        </div>

        {/* Controles globales */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="grid gap-1">
            <label className="responsive-text text-gray-500">
              Moneda (Global)
            </label>
            <select
              className="responsive-text border rounded px-3 py-2 min-w-[140px]"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="VES">Bs (VES)</option>
            </select>
          </div>

          {currency === "VES" && (
            <div className="grid gap-1">
              <label className="responsive-text text-gray-500">
                Tasa Global (sugerida: {bcvRate || "—"})
              </label>
              <input
                type="number"
                min="0"
                step="0.000001"
                className="responsive-text border rounded px-3 py-2 min-w-[160px]"
                placeholder="Tasa (Bs/USD)"
                value={fxRate}
                onChange={(e) => setFxRate(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Establecimiento */}
      <div className="grid gap-2">
        <ClientPicker
          showInfo={false}
          selectedClientId={selectedClientId}
          setSelectedClientId={setSelectedClientId}
          includeProspects={true}
          canCreateProspect={true}
          autoSelectFirst={false}
        />
      </div>

      {/* Categoría/Subcategoría */}
      <div className="grid gap-2">
        <CategoryPicker
          selectedCatId={selectedCatId}
          setSelectedCatId={setSelectedCatId}
        />
      </div>

      {/* Búsqueda */}
      <SearchBar
        placeholder="Buscar producto de la subcategoría…"
        onChange={setQ}
      />

      {/* Lista de productos */}
      <div className="border rounded">
        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 border-b text-sm font-medium">
          {/* Encabezados alineados con las columnas del row (2 img + 6 info + 4 precio) */}
          <div className="col-span-8">Producto</div>
          <div className="col-span-4">
            Precio {currency === "VES" ? "(Bs)" : "(USD)"}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="px-3 py-6 text-gray-500">
            No hay productos para la subcategoría seleccionada.
          </div>
        ) : (
          filteredProducts.map((p) => (
            <MarketProductRow
              key={p.id}
              product={p}
              value={lines[p.id]}
              currency={currency}
              fxRate={fxRate || bcvRate}
              onChange={(v) => setLine(p.id, v)}
            />
          ))
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className={`responsive-text px-4 py-2 rounded text-white ${
            canSubmit ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-300"
          }`}
          disabled={!canSubmit}
        >
          Guardar precios
        </button>
      </div>
    </div>
  );
};

export default NewMarketCheckPage;
