import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardFilters from "../dashboardFilters/DashboardFilters";
import DynamicBarChart from "../dynamicBarChart/DynamicBarChart";
import { getCompetitorPrices } from "../slices/marketProductsSlice";
import { getClients } from "../slices/clientsSlice";

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const { competitorPrices, clientCategoryProducts } = useSelector(
    (state) => state.marketProducts
  );

  const [category, setCategory] = useState();
  const [brand, setBrand] = useState();
  const [marketProduct, setMarketProduct] = useState();
  const [presentation, setPresentation] = useState(null);
  const [weight, setWeight] = useState(null);
  const [clientId, setClientId] = useState();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [excludedProductIds, setExcludedProductIds] = useState(new Set());

  useEffect(() => {
    dispatch(getClients());
  }, []);

   useEffect(() => {
     if (!clientId) return;
     if (!clientCategoryProducts || !clientCategoryProducts.length) return;

     const productIds = clientCategoryProducts.map((p) => p.id);

     dispatch(
       getCompetitorPrices({
         productIds,
         clientIds: [Number(clientId)],
         latest: true,
         startDate: startDate
           ? startDate.toISOString().split("T")[0]
           : undefined,
         endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
       })
     );
   }, [clientId, clientCategoryProducts, startDate, endDate, dispatch]);

  const priceData = useMemo(
    () =>
      competitorPrices
        .filter((r) => !excludedProductIds.has(r.product_id))
        .map((item) => ({
          id: item.product_id,
          name: item.product_name,
          value: item.price_usd,
        })),
    [competitorPrices, excludedProductIds]
  );

  const productChips = useMemo(() => {
    const byId = new Map();
    competitorPrices.forEach((r) => byId.set(r.product_id, r.product_name));
    return Array.from(byId.entries()).map(([id, name]) => ({ id, name }));
  }, [competitorPrices]);

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
        clientId={clientId}
        setClientId={setClientId}
        showClient
        showBrand={false}
        showProduct={false}
      />

      {clientId && category && (
        <>
          <DynamicBarChart
            data={priceData}
            title="Precios por producto en el establecimiento"
            orientation="horizontal"
            avgLine
            colorMode="conditional"
            sort="desc"
          />

          <div className="mt-4 flex flex-wrap gap-2 border rounded-xl p-2">
            {productChips.map((p) => {
              const isExcluded = excludedProductIds.has(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() =>
                    setExcludedProductIds((prev) => {
                      const next = new Set(prev);
                      next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                      return next;
                    })
                  }
                  className={`px-3 py-1 rounded-full text-sm border ${
                    isExcluded
                      ? "bg-neutral-100 text-neutral-500 border-neutral-300 line-through"
                      : "bg-white hover:bg-neutral-50"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientDashboard;
