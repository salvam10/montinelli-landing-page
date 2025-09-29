// DynamicBarChart.jsx
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Brush,
  LabelList,
  Cell,
} from "recharts";
import { useMemo } from "react";

/**
 * Props esperadas:
 *  - data: [{ id?: string|number, name: string, value: number }]
 *  - title?: string
 *  - avgLine?: boolean
 *  - orientation?: "vertical" | "horizontal"
 *  - barWidth?: number
 *  - showBrush?: boolean
 *  - showValueLabels?: boolean
 *  - colorMode?: "solid" | "conditional" | "alternating"
 *  - solidColor?: string
 *  - topN?: number
 *  - sort?: "asc" | "desc" | "none"
 *  - onBarClick?: (rechartsPayload) => void
 *  - highlightId?: string|number            // <-- NUEVO: id (o name) a resaltar
 *  - highlightColor?: string                // <-- NUEVO: color del resaltado
 */

const trelloColors = [
  "#0079bf",
  "#70b500",
  "#ff9f1a",
  "#eb5a46",
  "#f2d600",
  "#c377e0",
  "#ff78cb",
  "#00c2e0",
  "#51e898",
  "#c4c9cc",
];

const DynamicBarChart = ({
  data,
  title = "Gráfico de Barras",
  avgLine = true,
  orientation = "vertical",
  barWidth = 40,
  showBrush = true,
  showValueLabels = true,
  colorMode = "conditional",
  solidColor = "#16a34a",
  topN,
  sort = "desc",
  onBarClick, // click por barra
  highlightId, // <-- NUEVO
  highlightColor = "#f59e0b", // <-- NUEVO (naranja)
}) => {
  // 1) ordenar y recortar
  const prepared = useMemo(() => {
    let d = [...(data || [])];
    if (sort !== "none") {
      d.sort((a, b) =>
        sort === "asc" ? a.value - b.value : b.value - a.value
      );
    }
    if (topN && topN > 0 && topN < d.length) d = d.slice(0, topN);
    return d;
  }, [data, topN, sort]);

  // 2) promedio (solo para colorMode=conditional y ReferenceLine)
  const avg = useMemo(() => {
    if (!prepared.length) return 0;
    return (
      prepared.reduce((s, x) => s + (Number(x.value) || 0), 0) / prepared.length
    );
  }, [prepared]);

  // 3) helpers de colores base (cuando NO es resaltado)
  const baseFill = (entry, idx) => {
    const v = entry.value;
    if (colorMode === "solid") return solidColor;
    if (colorMode === "alternating")
      return idx % 2 === 0 ? "#2563eb" : "#60a5fa";
    // conditional: verde < avg, gris ≈, rojo > avg
    if (v < avg * 0.98) return "#10b981"; // debajo del promedio
    if (v > avg * 1.02) return "#ef4444"; // encima del promedio
    return "#6b7280"; // cerca del promedio
  };

  // 4) tamaño para scroll
  const chartWidth = Math.max(prepared.length * (barWidth + 16), 600);
  const chartHeight = Math.max(prepared.length * (barWidth * 0.7), 320);

  const xKey = "name";
  const yKey = "value";

  const ChartCore = (
    <BarChart
      data={prepared}
      layout={orientation === "horizontal" ? "vertical" : "horizontal"}
      width={orientation === "horizontal" ? 800 : chartWidth}
      height={orientation === "horizontal" ? chartHeight : 360}
      margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
      barCategoryGap={16}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      {orientation === "horizontal" ? (
        <>
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            dataKey={xKey}
            type="category"
            width={140}
            tick={{ fontSize: 12 }}
            interval={0}
          />
        </>
      ) : (
        <>
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={60}
            tickFormatter={(t) => (t?.length > 18 ? t.slice(0, 18) + "…" : t)}
          />
          <YAxis tick={{ fontSize: 12 }} />
        </>
      )}

      <Tooltip
        formatter={(v) => [`$${Number(v).toFixed(2)}`, "Valor"]}
        labelStyle={{ fontWeight: "bold" }}
      />

      {avgLine && (
        <ReferenceLine
          y={orientation === "horizontal" ? undefined : avg}
          x={orientation === "horizontal" ? avg : undefined}
          stroke="#111827"
          strokeDasharray="4 4"
          label={{
            value: `Promedio $${avg.toFixed(2)}`,
            position: "insideTopRight",
            fill: "#111827",
            fontSize: 12,
          }}
        />
      )}

      <Bar
        dataKey={yKey}
        radius={[8, 8, 0, 0]}
        onClick={(d) => onBarClick?.(d)}
        style={{ cursor: onBarClick ? "pointer" : "default" }}
      >
        {prepared.map((entry, index) => {
          // <-- LÓGICA DE RESALTADO
          const isHighlight =
            highlightId !== undefined &&
            (entry.id === highlightId || entry.name === highlightId);
          const fill = isHighlight ? highlightColor : baseFill(entry, index);

          return (
            <Cell key={`cell-${entry.id ?? entry.name ?? index}`} fill={fill} />
          );
        })}
        {showValueLabels && prepared.length <= 25 && (
          <LabelList
            dataKey={yKey}
            position={orientation === "horizontal" ? "right" : "top"}
            formatter={(val) => `$${Number(val).toFixed(2)}`}
          />
        )}
      </Bar>

      {showBrush && prepared.length > 20 && (
        <Brush dataKey={xKey} height={20} travellerWidth={10} />
      )}
    </BarChart>
  );

  return (
    <div className="w-full rounded-2xl border p-4 bg-white shadow-sm">
      <div className="text-lg font-semibold mb-3">{title}</div>

      {orientation === "horizontal" ? (
        <div className="w-full overflow-y-auto" style={{ maxHeight: 420 }}>
          {ChartCore}
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div style={{ width: chartWidth, height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              {ChartCore}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicBarChart;
