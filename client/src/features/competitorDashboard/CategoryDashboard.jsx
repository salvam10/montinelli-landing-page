import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardFilters from "../dashboardFilters/DashboardFilters";
import {
  getCompetitorPrices,
  getCompetitorProductsSummary,
} from "../slices/marketProductsSlice";
import CategoryInsights from "../categoryInsights/CategoryInsights";
import { getFilteredMarketData } from "../slices/marketProductsSlice";

const CategoryDashboard = () => {
  const dispatch = useDispatch();
  const { competitorPrices, productsSummary, filteredProducts } = useSelector(
    (state) => state.marketProducts
  );
  const { locationClients = [] } = useSelector((state) => state.clients || {});
  const [category, setCategory] = useState();
  const [brand, setBrand] = useState(null);
  const [presentation, setPresentation] = useState(null);
  const [weight, setWeight] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [excludedClientIds, setExcludedClientIds] = useState(new Set());
  const [excludedProductIds, setExcludedProductIds] = useState(new Set());
  const [searchClient, setSearchClient] = useState("");

  // 1) Filtro inteligente de productos por categoría + marca + presentación + peso
  useEffect(() => {
    if (category) {
      dispatch(
        getFilteredMarketData({
          categoryId: category,
          brandId: brand || undefined,
          presentation: presentation || undefined,
          weight: weight || undefined,
        })
      );
    }
  }, [category, brand, presentation, weight, dispatch]);

  // 2) Resumen de productos (tabla) usando los productos filtrados
  useEffect(() => {
    if (!filteredProducts || !filteredProducts.length) return;

    const productIds = filteredProducts.map((p) => p.id);
    const clientIds =
      locationClients && locationClients.length
        ? locationClients.map((c) => c.id)
        : undefined;

    dispatch(
      getCompetitorProductsSummary({
        productIds,
        excludeClientIds: Array.from(excludedClientIds).join(",") || undefined,
        excludeProductIds:
          Array.from(excludedProductIds).join(",") || undefined,
        startDate: startDate
          ? startDate.toISOString().split("T")[0]
          : undefined,
        endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
        clientIds,
      })
    );
  }, [
    filteredProducts,
    excludedClientIds,
    excludedProductIds,
    startDate,
    endDate,
    locationClients,
    dispatch,
  ]);

  // 3) Datos del gráfico usando los mismos productos filtrados y excluyendo clientes
  useEffect(() => {
    if (!filteredProducts || !filteredProducts.length) return;

    const productIds = filteredProducts.map((p) => p.id);
    const clientIds =
      locationClients && locationClients.length
        ? locationClients.map((c) => c.id)
        : undefined;


    dispatch(
      getCompetitorPrices({
        productIds,
        latest: true,
        startDate: startDate
          ? startDate.toISOString().split("T")[0]
          : undefined,
        endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
        excludeClientIds: Array.from(excludedClientIds),
        clientIds
      })
    );
  }, [filteredProducts, excludedClientIds, startDate, endDate, dispatch]);

  const clientsCatalog = useMemo(() => {
    const byId = new Map();
    competitorPrices.forEach((r) => byId.set(r.client_id, r.client_name));
    return Array.from(byId.entries()).map(([id, name]) => ({ id, name }));
  }, [competitorPrices]);

  const toggleClient = (clientId) => {
    setExcludedClientIds((prev) => {
      const next = new Set(prev);
      next.has(clientId) ? next.delete(clientId) : next.add(clientId);
      return next;
    });
  };

  const chips = useMemo(() => {
    const q = searchClient.trim().toLowerCase();
    return clientsCatalog
      .filter((c) => (q ? c.name.toLowerCase().includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clientsCatalog, searchClient]);

  const productsCatalog = useMemo(() => {
    const byId = new Map();
    productsSummary?.data?.forEach((r) =>
      byId.set(r.product_id, r.product_name)
    );
    return Array.from(byId.entries()).map(([id, name]) => ({ id, name }));
  }, [productsSummary]);

  return (
    <div className="w-full h-screen overflow-x-hidden ">
      <DashboardFilters
        category={category}
        setCategory={setCategory}
        brand={brand}
        setBrand={setBrand}
        showBrand={true}
        presentation={presentation}
        setPresentation={setPresentation}
        weight={weight}
        setWeight={setWeight}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        showProduct={false}
        showClient={false}
      />

      {category && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="text-sm text-neutral-600 mb-2">
                Excluir/Agregar establecimientos (clic en chip):
              </div>
              <input
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                placeholder="Buscar establecimiento…"
                className="border rounded-lg px-3 py-2 w-64 mb-3"
              />
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
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <CategoryInsights
            productsSummary={productsSummary}
            productChips={productsCatalog}
            productsCatalog={productsCatalog}
            excludedProductIds={excludedProductIds}
            toggleProduct={(id) =>
              setExcludedProductIds((prev) => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
              })
            }
          />
        </>
      )}
    </div>
  );
};

export default CategoryDashboard;
