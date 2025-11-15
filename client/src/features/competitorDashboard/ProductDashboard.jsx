import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardFilters from "../dashboardFilters/DashboardFilters";
import DynamicBarChart from "../dynamicBarChart/DynamicBarChart";
import { getCompetitorPrices } from "../slices/marketProductsSlice";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ProductDashboard = () => {
  const dispatch = useDispatch();
  const { competitorPrices} = useSelector(
    (state) => state.marketProducts
  );
  const { locationClients = [] } = useSelector((state) => state.clients || {});


  const [category, setCategory] = useState();
  const [brand, setBrand] = useState();
  const [marketProduct, setMarketProduct] = useState();
  const [presentation, setPresentation] = useState(null);
  const [weight, setWeight] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [excludedClientIds, setExcludedClientIds] = useState(new Set());
  const [searchClient, setSearchClient] = useState("");

  const locationClientIds = useMemo(
    () => (locationClients || []).map((c) => Number(c.id)).filter(Boolean),
    [locationClients]
  );

  useEffect(() => {
    if (!marketProduct) return;

    const clientIdsParam =
      locationClientIds && locationClientIds.length
        ? locationClientIds
        : undefined;

    dispatch(
      getCompetitorPrices({
        productIds: [Number(marketProduct)],
        clientIds: clientIdsParam,
        latest: true,
        startDate: startDate
          ? startDate.toISOString().split("T")[0]
          : undefined,
        endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
      })
    );
  }, [marketProduct, startDate, endDate, dispatch, locationClientIds]);


  const clientsCatalog = useMemo(() => {
    const byId = new Map();
    competitorPrices.forEach((r) => byId.set(r.client_id, r.client_name));
    return Array.from(byId.entries()).map(([id, name]) => ({ id, name }));
  }, [competitorPrices]);

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

  return (
    <div className="w-full h-screen overflow-x-hidden">
      <DashboardFilters
        category={category}
        setCategory={setCategory}
        brand={brand}
        setBrand={setBrand}
        marketProduct={marketProduct}
        setMarketProduct={setMarketProduct}
        presentation={presentation}
        setPresentation={setPresentation}
        weight={weight}
        setWeight={setWeight}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        showClient={false}
      />

      {marketProduct && (
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

          <DynamicBarChart
            data={priceData}
            title="Precio del producto por establecimiento"
            orientation="vertical"
            avgLine
            colorMode="conditional"
            sort="desc"
          />
        </>
      )}
    </div>
  );
};

export default ProductDashboard;
