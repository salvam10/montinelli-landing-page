// src/components/categoryInsights/CategoryInsights.jsx
import React, { useMemo, useEffect } from "react";
import DynamicBarChart from "../dynamicBarChart/DynamicBarChart";

const CategoryInsights = ({
  productsSummary,
  selectedProductId,
  productChips,
  productsCatalog,
  excludedProductIds, 
  toggleProduct,
}) => {
  const rows = productsSummary?.data ?? [];
  
  const { agg = "median", category_center } = productsSummary?.meta ?? {};
  const centerLabel = agg === "mean" ? "Media" : "Mediana";
  

  const chartData = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      const av = a.clients_count ?? a.clients_count ?? 0;
      const bv = b.clients_count ?? b.clients_count ?? 0;
      return bv - av;
    });
    return sorted.map((r) => ({
      id: r.product_id,
      name: r.product_name,
      value: r.mean_price ?? r.median_price ?? null,
      p25: r.p25,
      p75: r.p75,
      clients: r.clients_count,
      index: r.price_index,
      isSelected: r.product_id === selectedProductId,
    }));
  }, [rows, selectedProductId]);

  return (
    <div className="mt-8">
      {/* Card del gráfico */}
      <div className="border rounded-2xl p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Insights de la Categoría</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-700">
            {centerLabel} categoría:{" "}
            {category_center ? `$${category_center.toFixed(2)}` : "—"} USD
          </span>
        </div>

        <DynamicBarChart
          data={chartData}
          orientation="horizontal"
          height={540}
          sort="desc"
          colorMode="bySelection"
          barHighlightById={selectedProductId}
          /* línea de referencia de la media/mediana con etiqueta */
          avgLine
          avgLineValue={category_center ?? undefined}
          avgLineLabel={`${centerLabel}: $${
            category_center?.toFixed(2) ?? "—"
          }`}
          yAxisWidth={180} // ayuda a que no se corten los nombres
          valueFormatter={(v) => (v == null ? "—" : `$${v.toFixed(2)}`)}
          tooltipFormatter={(d) => ({
            title: d.name,
            lines: [
              `${centerLabel}: ${(d.value ?? 0).toFixed(2)} USD`,
              `p25–p75: ${d.p25?.toFixed(2) ?? "—"} – ${
                d.p75?.toFixed(2) ?? "—"
              } USD`,
              `Índice: ${d.index ? d.index.toFixed(2) : "—"}`,
              `Clientes: ${d.clients}`,
            ],
          })}
        />
      </div>

      {/* Chips de productos */}
      <div className="flex flex-wrap gap-2 max-h-28 overflow-auto border rounded-xl p-2">
        {productChips.map((p) => {
          const isExcluded = excludedProductIds.has(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggleProduct(p.id)}
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
              {p.name}
            </button>
          );
        })}
      </div>
      
      {/* Card de la tabla (debajo) */}
      <div className="mt-6 border rounded-2xl p-4 bg-white overflow-auto">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-base font-semibold">Detalle</h3>
          <span className="text-xs text-neutral-500">
            Ordenado por {centerLabel}
          </span>
        </div>

        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-neutral-50">
            <tr>
              <th className="px-3 py-2 text-left">Producto</th>
              <th className="px-3 py-2 text-right">Clientes</th>
              <th className="px-3 py-2 text-right">p25</th>
              <th className="px-3 py-2 text-right">{centerLabel}</th>
              <th className="px-3 py-2 text-right">p75</th>
              <th className="px-3 py-2 text-right">Índice</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((r) => (
              <tr key={r.id} className={r.isSelected ? "bg-yellow-50" : ""}>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2 text-right">{r.clients}</td>
                <td className="px-3 py-2 text-right">
                  {r.p25 != null ? r.p25.toFixed(2) : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  {r.value != null ? r.value.toFixed(2) : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  {r.p75 != null ? r.p75.toFixed(2) : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  {r.index != null ? r.index.toFixed(2) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryInsights;
