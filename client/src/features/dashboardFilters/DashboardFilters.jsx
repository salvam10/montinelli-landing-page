import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CustomCombobox from "../customCombobox/CustomCombobox";
import CustomDatePicker from "../customDatePicker/CustomDatePicker";
import { getCategories } from "../slices/categoriesSlice";
import {
  getFilteredMarketData,
  getClientCategoryFilters,
} from "../slices/marketProductsSlice";
import { getClientsByLocation } from "../slices/clientsSlice";

const DashboardFilters = ({
  category,
  setCategory,

  brand,
  setBrand,

  marketProduct,
  setMarketProduct,

  presentation,
  setPresentation,

  weight,
  setWeight,

  startDate,
  setStartDate,

  endDate,
  setEndDate,

  clientId,
  setClientId,

  showProduct = true,
  showBrand = true,
  showClient = false, // no lo usamos aún pero queda listo por si agregamos cliente
}) => {
  const { categories } = useSelector((state) => state.categories);
  const {
    filteredProducts,
    filteredBrands,
    filteredPresentations,
    filteredWeights,
    clientCategories,
    clientCategoryProducts,
    clientPresentations,
    clientWeights,
  } = useSelector((state) => state.marketProducts);

  const {
    clients = [],
    locationStates = [],
    locationCities = [],
    locationMunicipalities = [],
    locationClients = [],
  } = useSelector((state) => state.clients || {});

  // filtros geográficos locales
  const [geoState, setGeoState] = useState(null);
  const [geoCity, setGeoCity] = useState(null);
  const [geoMunicipality, setGeoMunicipality] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      getClientsByLocation({
        state: geoState || undefined,
        city: geoCity || undefined,
        municipality: geoMunicipality || undefined,
      })
    );
  }, [geoState, geoCity, geoMunicipality, dispatch]);

  useEffect(() => {
    if (
      showClient &&
      clientId &&
      locationClients.length &&
      !locationClients.some((c) => Number(c.id) === Number(clientId))
    ) {
      setClientId(null);
    }
  }, [showClient, clientId, locationClients, setClientId]);

  /* cambiar cliente */
  useEffect(() => {
    if (!showClient) return;
    if (!setClientId) return;

    if (clientId) {
      // cuando cambio de cliente, reseteo y traigo categorías de ese cliente
      dispatch(getClientCategoryFilters({ clientId }));

      setCategory?.(null);
      setBrand?.(null);
      setMarketProduct?.(null);
      setPresentation?.(null);
      setWeight?.(null);
      setStartDate?.(null);
      setEndDate?.(null);
    } else {
      // si limpio el cliente, limpio también categoría y demás
      setCategory?.(null);
      setBrand?.(null);
      setMarketProduct?.(null);
      setPresentation?.(null);
      setWeight?.(null);
    }
  }, [clientId, showClient]);

  /* ------------------------------- cargar categorías ------------------------------ */
  useEffect(() => {
    dispatch(getCategories({ level: "subcategory" }));
  }, [dispatch]);

  /* ----------------------------- filtros por categoría (no ClientDashboard) ----------------------------- */
  useEffect(() => {
    if (showClient) return;
    if (!category) return;

    const clientIds =
      locationClients && locationClients.length
        ? locationClients.map((c) => Number(c.id)).filter(Boolean)
        : [];

    dispatch(
      getFilteredMarketData({
        categoryId: category,
        brandId: brand || undefined,
        presentation: presentation || undefined,
        weight: weight || undefined,
        clientIds: clientIds.length ? clientIds : undefined,
      })
    );

    setMarketProduct?.(null);
  }, [
    category,
    brand,
    presentation,
    weight,
    showClient,
    locationClients,
    dispatch,
    setMarketProduct,
  ]);

  /* cambiar presentacion o peso en client dashboard */
  useEffect(() => {
    if (!showClient) return;
    if (!clientId || !category) return;

    // si no hay categoría todavía, no hacemos nada
    dispatch(
      getClientCategoryFilters({
        clientId,
        categoryId: category,
        presentation: presentation || undefined,
        weight: weight || undefined,
      })
    );

    setMarketProduct?.(null);
  }, [presentation, weight, showClient, clientId, category]);

  /* -------------------------------- options -------------------------------- */
  // Categorías:
  // - si showClient: categorías que vende ese cliente
  // - si no: todas las subcategorías del sistema
  const catOptions = showClient
    ? (clientCategories || []).map((c) => ({
        value: c.id,
        label: c.name,
      }))
    : categories?.map((c) => ({ value: c.id, label: c.name })) || [];

  const stateOptions =
    locationStates.map((s) => ({ value: s, label: s })) || [];

  const cityOptions = locationCities.map((c) => ({ value: c, label: c })) || [];

  const municipalityOptions =
    locationMunicipalities.map((m) => ({ value: m, label: m })) || [];

  const brandsOptions =
    filteredBrands?.map((b) => ({ value: b.id, label: b.name })) || [];

  const baseProducts = showClient
    ? clientCategoryProducts || []
    : filteredProducts || [];
  const visibleProducts = baseProducts;

  const marketProdsOptions = visibleProducts.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const presentationOptions = showClient
    ? (clientPresentations || []).map((p) => ({
        value: p,
        label: p,
      }))
    : (filteredPresentations || []).map((p) => ({
        value: p,
        label: p,
      }));

  const weightOptions = showClient
    ? (clientWeights || []).map((n) => ({
        value: String(n),
        label: `${n} g`,
      }))
    : (filteredWeights || []).map((n) => ({
        value: String(n),
        label: `${n} g`,
      }));

  /* --------------------- auto-set de presentación/peso --------------------- */
  useEffect(() => {
    if (!marketProduct) return;

    const p = (filteredProducts || []).find(
      (x) => Number(x.id) === Number(marketProduct)
    );

    if (p) {
      setPresentation?.(p.presentation ?? null);
      setWeight?.(p.weight_g != null ? String(p.weight_g) : null);
    }
  }, [marketProduct, filteredProducts]);

  /* -------------------------------- render -------------------------------- */
  return (
    <div className="w-full flex flex-wrap gap-4 py-6">
      {/* Estado */}
      <div className="w-[220px]">
        <CustomCombobox
          selected={geoState}
          setSelected={(val) => {
            setGeoState(val);
            setGeoCity(null);
            setGeoMunicipality(null);
          }}
          options={stateOptions}
          label="Estado"
        />
      </div>

      {/* Ciudad */}
      <div className="w-[220px]">
        <CustomCombobox
          selected={geoCity}
          setSelected={(val) => {
            setGeoCity(val);
            setGeoMunicipality(null);
          }}
          options={cityOptions}
          label="Ciudad"
        />
      </div>

      {/* Municipio */}
      <div className="w-[220px]">
        <CustomCombobox
          selected={geoMunicipality}
          setSelected={setGeoMunicipality}
          options={municipalityOptions}
          label="Municipio"
        />
      </div>

      {/* Cliente (solo Client Dashboard) */}
      {showClient && (
        <div className="w-[300px]">
          <CustomCombobox
            selected={clientId}
            setSelected={setClientId}
            options={
              (locationClients.length ? locationClients : clients).map((c) => ({
                value: c.id,
                label: c.name,
              })) || []
            }
            label="Cliente"
          />
        </div>
      )}

      {/* Categoría */}
      <div className="w-[300px]">
        <CustomCombobox
          selected={category}
          setSelected={setCategory}
          options={catOptions}
          label="Categoría"
        />
      </div>

      {/* Marca */}
      {category && showBrand && !showClient && (
        <div className="w-[80]">
          <CustomCombobox
            selected={brand}
            setSelected={setBrand}
            options={brandsOptions}
            label="Marca"
          />
        </div>
      )}

      {/* Producto (solo si showProduct=true) */}
      {category && showProduct && (
        <div className="w-96">
          <CustomCombobox
            selected={marketProduct}
            setSelected={setMarketProduct}
            options={marketProdsOptions}
            label="Producto"
          />
        </div>
      )}

      {/* Presentación */}
      {category && (
        <div className="w-64">
          <CustomCombobox
            selected={presentation}
            setSelected={setPresentation}
            options={presentationOptions}
            label="Presentación"
          />
        </div>
      )}

      {/* Peso */}
      {category && (
        <div className="w-48">
          <CustomCombobox
            selected={weight}
            setSelected={setWeight}
            options={weightOptions}
            label="Peso"
          />
        </div>
      )}

      {/* Fechas */}
      {category && (
        <div className="flex gap-3 items-end mt-2">
          <div className="w-48">
            <CustomDatePicker
              selectedDate={startDate}
              onChange={setStartDate}
              label="Desde"
              placeholder="Selecciona fecha inicial"
              maxDate={endDate}
            />
          </div>

          <div className="w-48">
            <CustomDatePicker
              selectedDate={endDate}
              onChange={setEndDate}
              label="Hasta"
              placeholder="Selecciona fecha final"
              minDate={startDate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;
