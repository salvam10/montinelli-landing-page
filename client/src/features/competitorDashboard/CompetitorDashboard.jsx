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
import { format } from "date-fns";
import { es } from "date-fns/locale";

const CompetitorDashboard = () => {
  const { competitorPrices, productsSummary } = useSelector(
    (state) => state.marketProducts
  );
  const [category, setCategory] = useState();
  const [marketProduct, setMarketProduct] = useState();
  const [brand, setBrand] = useState();

  const [excludedClientIds, setExcludedClientIds] = useState(() => new Set());
  const [excludedProductIds, setExcludedProductIds] = useState(() => new Set());
  const [searchClient, setSearchClient] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    if (!category) return;

    // helper interno
    const joinSet = (s) =>
      s && s.size
        ? Array.from(s)
            .sort((a, b) => a - b)
            .join(",")
        : undefined;

    const excludeClientIds = joinSet(excludedClientIds);
    const excludeProductIds = joinSet(excludedProductIds);

    dispatch(
      getCompetitorProductsSummary({
        categoryId: Number(category),
        excludeClientIds,
        excludeProductIds,
      })
    );
  }, [category, excludedClientIds, excludedProductIds, dispatch]);

  useEffect(() => {
    if (marketProduct) {
      dispatch(
        getCompetitorPrices({ productIds: marketProduct, latest: true })
      );
      setExcludedClientIds(new Set()); // reset exclusiones al cambiar producto
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

  // catálogo de productos presentes en la data
  const productsCatalog = useMemo(() => {
    const byId = new Map();
    productsSummary?.data?.forEach((r) => {
      byId.set(r.product_id, r.product_name);
    });
    return Array.from(byId.entries()).map(([id, name]) => ({ id, name }));
  }, [productsSummary]);

  // data filtrada para el gráfico
  const priceData = useMemo(
    () =>
      competitorPrices
        .filter((r) => !excludedClientIds.has(r.client_id))
        .map((item) => ({
          id: item.client_id,
          name: item.client_name,
          value: item.price_usd,
          date: item.created_at
            ? format(new Date(item.created_at), "d 'de' MMM 'de' yyyy", {
                locale: es,
              })
            : null,
        })),
    [competitorPrices, excludedClientIds]
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

  // handlers incluir/excluir
  const toggleProduct = (productId) => {
    setExcludedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const resetFilters = () => {
    setExcludedClientIds(new Set());
    setSearchClient("");
  };

  // UI chips (con búsqueda)
  const chips = useMemo(() => {
    const q = searchClient.trim().toLowerCase();
    return clientsCatalog
      .filter((c) => (q ? c.name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clientsCatalog, searchClient]);

  const productChips = useMemo(() => {
    return productsCatalog.sort((a, b) => a.name.localeCompare(b.name));
  }, [productsCatalog]);

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
            Excluir/Agregar establecimientos (clic en chip):
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
              placeholder="Buscar establecimiento…"
              className="border rounded-lg px-3 py-2 w-64"
            />
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl border text-sm hover:bg-neutral-50"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-28 overflow-auto border rounded-xl p-2">
            {chips.map((c) => {
              const isExcluded = excludedClientIds.has(c.id);
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
            <div>Excluidos: {excludedClientIds.size}</div>
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
      />
      {category && (
        <CategoryInsights
          productsSummary={productsSummary}
          selectedProductId={marketProduct}
          productChips={productChips}
          productsCatalog={productsCatalog}
          excludedProductIds={excludedProductIds}
          toggleProduct={toggleProduct}
        />
      )}
    </div>
  );
};

export default CompetitorDashboard;
