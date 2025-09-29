// CompetitorDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import DashboardFilters from "../dashboardFilters/DashboardFilters";
import DynamicBarChart from "../dynamicBarChart/DynamicBarChart";
import {
  getCompetitorPrices,
  getCompetitorProductsSummary,
} from "../slices/marketProductsSlice";
import CategoryInsights from "../categoryInsights/CategoryInsights";

const iqrOutliers = (arr) => {
  if (arr.length < 4) return new Set();
  const vals = [...arr].sort((a, b) => a - b);
  const q1 = vals[Math.floor((vals.length - 1) * 0.25)];
  const q3 = vals[Math.floor((vals.length - 1) * 0.75)];
  const iqr = q3 - q1;
  const low = q1 - 1.5 * iqr;
  const high = q3 + 1.5 * iqr;
  const out = new Set();
  arr.forEach((v, idx) => {
    if (v < low || v > high) out.add(idx);
  });
  return { low, high, outlierIdx: out };
};

const CompetitorDashboard = () => {
  const { competitorPrices, productsSummary } = useSelector(
    (state) => state.marketProducts
  );
  const [category, setCategory] = useState();
  const [marketProduct, setMarketProduct] = useState();
  const [brand, setBrand] = useState();

  const [excludedClientIds, setExcludedClientIds] = useState(() => new Set());
  const [searchClient, setSearchClient] = useState("");
  const [excludeOutliers, setExcludeOutliers] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCompetitorProductsSummary({ categoryId: category }));
  }, [category]);

  useEffect(() => {
    if (marketProduct) {
      dispatch(
        getCompetitorPrices({ productIds: marketProduct, latest: true })
      );
      setExcludedClientIds(new Set()); // reset exclusiones al cambiar producto
      setExcludeOutliers(false);
    }
  }, [marketProduct, dispatch]);

  // catálogo de clientes presentes en la data
  const clientsCatalog = useMemo(() => {
    const byId = new Map();
    competitorPrices.forEach((r) => {
      byId.set(r.client_id, r.client_name);
    });
    return Array.from(byId.entries()).map(([id, name]) => ({ id, name }));
  }, [competitorPrices]);

  // excluir atípicos (IQR) si el toggle está prendido
  const outlierClientIds = useMemo(() => {
    if (!excludeOutliers) return new Set();
    const values = competitorPrices.map((r) => r.price_usd);
    const { outlierIdx } = iqrOutliers(values);
    const ids = new Set();
    competitorPrices.forEach((r, idx) => {
      if (outlierIdx.has(idx)) ids.add(r.client_id);
    });
    return ids;
  }, [excludeOutliers, competitorPrices]);

  // conjunto final excluido = manual ⊔ outliers
  const effectiveExcluded = useMemo(() => {
    const s = new Set(excludedClientIds);
    outlierClientIds.forEach((id) => s.add(id));
    return s;
  }, [excludedClientIds, outlierClientIds]);

  // data filtrada para el gráfico
  const priceData = useMemo(
    () =>
      competitorPrices
        .filter((r) => !effectiveExcluded.has(r.client_id))
        .map((item) => ({
          id: item.client_id,
          name: item.client_name,
          value: item.price_usd,
        })),
    [competitorPrices, effectiveExcluded]
  );

  // handlers incluir/excluir
  const toggleClient = (clientId) => {
    setExcludedClientIds((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) next.delete(clientId);
      else next.add(clientId);
      return next;
    });
  };

  // click en barra
  const handleBarClick = (payload) => {
    const point = payload?.activePayload?.[0]?.payload; // Recharts
    if (point?.id) toggleClient(point.id);
  };

  const resetFilters = () => {
    setExcludedClientIds(new Set());
    setExcludeOutliers(false);
    setSearchClient("");
  };

  // UI chips (con búsqueda)
  const chips = useMemo(() => {
    const q = searchClient.trim().toLowerCase();
    return clientsCatalog
      .filter((c) => (q ? c.name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clientsCatalog, searchClient]);

  return (
    <div className="w-full overflow-x-hidden px-6">
      <DashboardFilters
        category={category}
        setCategory={setCategory}
        marketProduct={marketProduct}
        setMarketProduct={setMarketProduct}
        brand={brand}
        setBrand={setBrand}
      />

      {/* Panel de exclusiones */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="text-sm text-neutral-600 mb-2">
            Excluir/Agregar establecimientos (clic en chip o en la barra):
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
              placeholder="Buscar establecimiento…"
              className="border rounded-lg px-3 py-2 w-64"
            />
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={excludeOutliers}
                onChange={(e) => setExcludeOutliers(e.target.checked)}
              />
              Excluir atípicos (IQR)
            </label>
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl border text-sm hover:bg-neutral-50"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-28 overflow-auto border rounded-xl p-2">
            {chips.map((c) => {
              const isExcluded = effectiveExcluded.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleClient(c.id)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    isExcluded
                      ? "bg-neutral-100 text-neutral-500 border-neutral-300 line-through"
                      : "bg-white hover:bg-neutral-50"
                  }`}
                  title={
                    isExcluded
                      ? "Actualmente excluido (clic para incluir)"
                      : "Clic para excluir"
                  }
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full md:w-64 h-fit border rounded-xl p-3 bg-white">
          <div className="text-sm text-neutral-500">Resumen</div>
          <div className="mt-2 text-sm">
            <div>Total puntos de venta: {clientsCatalog.length}</div>
            <div>Excluidos: {effectiveExcluded.size}</div>
            <div>Mostrando: {priceData.length}</div>
          </div>
        </div>
      </div>

      <DynamicBarChart
        data={priceData}
        title="Precio por Cadena"
        orientation="vertical"
        avgLine
        showBrush
        colorMode="conditional"
        sort="desc"
        onBarClick={handleBarClick} // <-- click para excluir/incluir
      />
      <CategoryInsights
        summary={productsSummary}
        selectedProductId={marketProduct}
      />
    </div>
  );
};

export default CompetitorDashboard;
